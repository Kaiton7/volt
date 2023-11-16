const data = {
    usernames:  ['Ben', 'Kaito', 'Risa', 'K9T', 'K2T', 'K1T', 'KcT', 'KaT', 'KdT','Tony', 'Sindy'],
    projects: ['Project1', 'Project2', 'Project3'],
    roles: [
      "roles/viewer",
      "roles/editor",
      "roles/owner",
      "roles/iam.securityAdmin",
      "roles/iam.securityReviewer",
      "roles/iam.securityCenterAdmin",
      "roles/storage.admin",
      "roles/storage.objectViewer",
      "roles/storage.objectCreator",
      "roles/compute.viewer",
      "roles/compute.admin",
      "roles/appengine.admin",
      "roles/cloudfunctions.developer",
      "roles/cloudsql.admin",
      "roles/cloudkms.admin",
      "roles/iam.roleAdmin",
      "roles/iam.roleViewer",
      "roles/iam.roleEditor",
      "roles/monitoring.viewer",
      "roles/monitoring.admin"
    ]
  };
  
  function autocompleteAndValidate(field) {
    const input = document.getElementById(field).value;
    const suggestions = document.getElementById(`${field}Suggestions`);
    const submitButton = document.getElementById('submitButton');
  
    suggestions.innerHTML = '';
  
    if (input === '') {
      validateForm();
      return;
    }
  
    const filteredData = data[field + 's'].filter(item => item.toLowerCase().startsWith(input.toLowerCase()));
  
    for (let i = 0; i < Math.min(filteredData.length, 5); i++) {
      const div = document.createElement('div');
      div.textContent = filteredData[i];
      div.onclick = function() {
        document.getElementById(field).value = filteredData[i];
        suggestions.innerHTML = '';
        validateForm();
      };
      suggestions.appendChild(div);
    }
  
    if (filteredData.length > 5) {
      const div = document.createElement('div');
      div.textContent = '...';
      suggestions.appendChild(div);
    }
  
    validateForm();
  }
  
  function validateForm() {
    const username = document.getElementById('username').value;
    const project = document.getElementById('project').value;
    const role = document.getElementById('role').value;
    const submitButton = document.getElementById('submitButton');
  
    if (data.usernames.includes(username) && data.projects.includes(project) && data.roles.includes(role)) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  }
  
// 既存のコードに追加
document.addEventListener('click', function(event) {
    const suggestionsList = ['usernameSuggestions', 'projectSuggestions', 'roleSuggestions'];
    
    for (const id of suggestionsList) {
      const suggestions = document.getElementById(id);
      if (suggestions) {
        // クリックされた要素がsuggestionsまたはその子要素でない場合
        if (!suggestions.contains(event.target)) {
          suggestions.innerHTML = '';
        }
      }
    }
  });

// 既存のコードに追加
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('userForm');
    
    form.addEventListener('submit', async function(event) {
      event.preventDefault(); // デフォルトのフォーム送信を防ぐ
      
      const username = document.getElementById('username').value;
      const project = document.getElementById('project').value;
      const role = document.getElementById('role').value;
      
      const payload = {
        username,
        project,
        role
      };
      
      try {
        const response = await fetch('/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Success:', data);
        } else {
          console.log('Error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      }
    });
  });
  