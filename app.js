const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {google} = require('googleapis')
const {GoogleAuth} = require('google-auth-library');

const app = express();
app.use(bodyParser.json());

async function setPolicy(projectId, policy){
  try{
    const auth = await google.auth.getClient({
      scopes:['https://www.googleapis.com/auth/cloud-platform']
    })
     // Cloud Resource Manager API クライアントの初期化
     const resourceManager = google.cloudresourcemanager('v1');

     // IAM ポリシーの設定
     const result = await resourceManager.projects.setIamPolicy({
       resource: projectId,
       auth: auth,
       requestBody: {
         policy: policy
       }
     });
 
     console.log('IAM Policy set successfully:', result.data);
     return result.data;
   } catch (error) {
     console.error('Error setting IAM Policy:', error.message);
     throw error;
   }
}


function addBinding(policy, binding) {
  const newPolicy = { ...policy };
  newPolicy.bindings.push(binding);
  newPolicy.version = 3;
  return newPolicy;
}


function get_expiry(period){
  return new Date(Date.now() + minitues *60 *  1000).toISOString();
}


function getBinding(expiry, userOrGroup, account, access, actor) {
  return {
    condition: {
      expression: `request.time < timestamp("${expiry}")`,
      description: 'This is a temporary grant created by Volt.',
      title: `granted by ${actor}`
    },
    members: [`${userOrGroup}:${account}`],
    role: access
  };
}


async function fetchPolicy(projectId, version = 3) {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const service = google.cloudresourcemanager('v1');
  const policy = await service.projects.getIamPolicy({
    resource: projectId,
    requestBody: { options: { requestedPolicyVersion: version } },
    auth: auth
  });
  return policy.data;
}

function removeConditionBindings(bindings) {
  return bindings.filter(b => !b.condition || !b.condition.title || !b.condition.title.includes('granted'));
}

async function clearCondition(project) {
  const newPolicy = await fetchPolicy(project);
  newPolicy.bindings = removeConditionBindings(newPolicy.bindings);
  newPolicy.version = 3;

  try {
    await setPolicy(project, newPolicy);
  } catch (error) {
    console.error('Could not apply new policy', error);
    return;
  }

  return;
}


function isTimestampExpired(expression) {
  // 現在の時刻を取得
  const currentTime = new Date();

  // expression から timestamp 部分を抽出
  const timestampMatch = expression.match(/timestamp\("(.+)"\)/);
  
  if (timestampMatch && timestampMatch[1]) {
    // タイムスタンプを Date オブジェクトに変換
    const timestamp = new Date(timestampMatch[1]);
    
    // 現在の時刻がタイムスタンプを過ぎているかどうかを判定
    return currentTime > timestamp;
  }

  // expression から timestamp が正しく取得できなかった場合はエラーとする
  throw new Error('Invalid timestamp expression format');
}

async function validate(policy, req){
  // もし既にあるbindingならそれは拒否する
  return policy.some(b => b.members==req.body.user && b.role==req.body.role);
  
}
// 静的ファイルを配信
app.use(express.static(path.join(__dirname, 'public')));

async function doAll(req){
  const expiry = get_expiry(req.body.period)
  const binding = getBinding(expiry, req.body.user_type,req.body.user, req.body.role, req.body.user)
  const policy = await fetchPolicy(req.body.project);
  const isok = await validate(policy,req);

  const newPolicy = addBinding(policy, binding);
  try {
    await setPolicy(req.body.project, newPolicy);
    console.log('Great success, they\'ll have access in a minute!', 'success');
  } catch (error) {
    console.error('Could not apply new policy', error);
    return;
  }
  
}
// APIエンドポイント
app.post('/submit', async function(req, res){
  console.log('Received data:', req.body);
  await doAll(req)
  res.status(200).send('Data received');
});

// サーバー起動
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000/');
});
