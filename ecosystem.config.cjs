// PM2 process config — used by `pm2 start ecosystem.config.cjs`
// Reference: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'amplifai',

      // Nuxt builds to .output/server/index.mjs (Nitro Node server)
      script: './.output/server/index.mjs',

      // Run as ESM
      interpreter: 'node',
      interpreter_args: '--experimental-vm-modules',

      // Keep only 2 old log files
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,

      // Environment (production values come from /var/www/amplifai/.env)
      env_production: {
        NODE_ENV: 'production',
        PORT: 8111,
        HOST: '127.0.0.1', // only listen locally — Nginx proxies inbound traffic
      },
    },
  ],
}
