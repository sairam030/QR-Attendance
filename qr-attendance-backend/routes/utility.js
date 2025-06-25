const express = require('express');
const os = require('os');
const router = express.Router();

router.get('/my-ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let preferredInterfaces = ['Wi-Fi', 'Ethernet', 'eth0', 'wlan0'];
  let localIp = '0.0.0.0';

  // Try preferred interfaces first
  for (const name of preferredInterfaces) {
    if (interfaces[name]) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIp = iface.address;
          break;
        }
      }
    }
    if (localIp !== '0.0.0.0') break;
  }

  // Fallback: any non-internal IPv4 address
  if (localIp === '0.0.0.0') {
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIp = iface.address;
          break;
        }
      }
      if (localIp !== '0.0.0.0') break;
    }
  }

  res.json({ ip: localIp });
});

module.exports = router;
