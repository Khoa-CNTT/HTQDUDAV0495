/**
 * Tạo mã phòng ngẫu nhiên gồm 6 ký tự (chữ cái và số)
 * @returns {string} 
 */
function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
  }

  /**
 * Định dạng ngày tháng
 * @param {Date} 
 * @returns {string} 
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }