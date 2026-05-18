module.exports = {
  apps: [{
    name: 'ecom-frontend',
    script: 'node',
    args: 'node_modules/next/dist/bin/next start -p 8000',
    cwd: '/var/www/shop-waterpro',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/waterpro/ecom-frontend-error.log',
    out_file: '/var/log/waterpro/ecom-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
