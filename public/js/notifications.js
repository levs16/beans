const showNotification = (message, type = 'default') => {
  console.log('Showing notification:', message, type);
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  console.log('Notification element added:', notification);
  
  setTimeout(() => {
    notification.classList.add('show');
    console.log('Show class added');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
      console.log('Notification removed');
    }, 300);
  }, 4000);
}; 