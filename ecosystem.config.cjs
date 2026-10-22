/** PM2 process file for Kipit customer web (Nitro). */
module.exports = {
  apps: [
    {
      name: "kipit-web",
      cwd: __dirname,
      script: "scripts/start.sh",
      interpreter: "bash",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "512M",
    },
  ],
};
