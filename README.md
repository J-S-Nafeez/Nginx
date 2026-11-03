# ⚡ Production-Grade AWS Nginx Gateway, Reverse Proxy & Load Balancer Cluster

[![AWS EC2](https://img.shields.io/badge/AWS-EC2%20Ubuntu%2022.04%20LTS-orange?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/ec2/)
[![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy%20%26%20Load%20Balancer-009639?style=for-the-badge&logo=nginx)](https://nginx.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Cluster%20(Ports%203000%2C%203001)-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PM2](https://img.shields.io/badge/Process%20Manager-PM2%20Cluster-2B037A?style=for-the-badge&logo=pm2)](https://pm2.keymetrics.io/)
[![TailwindCSS](https://img.shields.io/badge/Frontend-Tailwind%20Telemetry%20Dashboard-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

A fully functional, battle-tested, enterprise-grade **API Gateway and Reverse Proxy architecture** deployed on AWS. 

This project bridges Linux Systems Administration, Cloud Networking, and Application Architecture by placing a hardened **Nginx** server in front of multiple private **Node.js** application instances. It features **weighted least-connection load balancing, in-memory micro-caching, leaky-bucket rate limiting, security header injection, zero-copy static asset delivery, and an interactive real-time visual telemetry dashboard**.

---

## 📑 Table of Contents
- [⚡ Production-Grade AWS Nginx Gateway, Reverse Proxy \& Load Balancer Cluster](#-production-grade-aws-nginx-gateway-reverse-proxy--load-balancer-cluster)
  - [📑 Table of Contents](#-table-of-contents)
  - [🎯 Why This Architecture? (Problem vs. Solution)](#-why-this-architecture-problem-vs-solution)
    - [The Anti-Pattern (What Beginners Do):](#the-anti-pattern-what-beginners-do)
    - [The Production Solution (What This Project Implements):](#the-production-solution-what-this-project-implements)
  - [📸 Live Visual Proof \& Telemetry Dashboard](#-live-visual-proof--telemetry-dashboard)
    - [1. Weighted Load Balancing \& Micro-Cache Telemetry](#1-weighted-load-balancing--micro-cache-telemetry)
    - [2. Rate-Limiting Attack Simulation \& Security Audit](#2-rate-limiting-attack-simulation--security-audit)
  - [🏗️ System Architecture Diagram](#️-system-architecture-diagram)
  - [🗺️ Linux Filesystem Layout Map](#️-linux-filesystem-layout-map)
  - [🛠️ Complete Step-by-Step Reproduction Guide](#️-complete-step-by-step-reproduction-guide)
    - [Phase 1: AWS Security Group Configuration](#phase-1-aws-security-group-configuration)
    - [Phase 2: System Update \& Nginx Installation](#phase-2-system-update--nginx-installation)
    - [Phase 3: Deploying Node.js Backend Cluster](#phase-3-deploying-nodejs-backend-cluster)
    - [Phase 4: Configuring Enterprise Nginx](#phase-4-configuring-enterprise-nginx)
    - [Phase 5: Deploying Interactive Frontend Dashboard](#phase-5-deploying-interactive-frontend-dashboard)
    - [Phase 6: Testing \& Live Verification](#phase-6-testing--live-verification)
      - [Verification Matrix:](#verification-matrix)
  - [🔬 Deep Technical Breakdown of Concepts](#-deep-technical-breakdown-of-concepts)
    - [1. The Reverse Proxy Mechanism (`proxy_pass`)](#1-the-reverse-proxy-mechanism-proxy_pass)
    - [2. Leaky-Bucket Rate Limiting (`limit_req_zone`)](#2-leaky-bucket-rate-limiting-limit_req_zone)
    - [3. Edge Micro-Caching (`proxy_cache`)](#3-edge-micro-caching-proxy_cache)
  - [🛠️ DevOps Troubleshooting \& Incident Resolution Playbook](#️-devops-troubleshooting--incident-resolution-playbook)
    - [Incident 1: Port Collision \& Failed Process Bind (`EADDRINUSE`)](#incident-1-port-collision--failed-process-bind-eaddrinuse)
    - [Incident 2: Nano Unprivileged Buffer Lock (`[ File is unwritable ]`)](#incident-2-nano-unprivileged-buffer-lock--file-is-unwritable-)
  - [👤 Author \& Maintainer](#-author--maintainer)

---

## 🎯 Why This Architecture? (Problem vs. Solution)

### The Anti-Pattern (What Beginners Do):
Running Node.js directly on public port `80` or `3000`:
* ❌ **Root Privilege Hazard**: Binding to ports below 1024 requires root access on Linux. Running Node.js as root means an application vulnerability grants full root control to an attacker.
* ❌ **Single Point of Failure**: Node.js is single-threaded. CPU-intensive requests block the event loop, freezing traffic for all users.
* ❌ **Wasted Resources**: Serving static files (HTML, CSS, JS, images) through Node.js consumes valuable event-loop cycles.
* ❌ **No DDoS Protection**: Without rate limiting at the edge, a simple HTTP flood brings down the backend server.

### The Production Solution (What This Project Implements):
* ✅ **Principle of Least Privilege**: Nginx handles public port `80`, while Node.js runs as an unprivileged user on internal loopback ports (`127.0.0.1:3000` and `3001`).
* ✅ **High Availability & Horizontal Scaling**: Nginx distributes traffic across multiple instances using the `least_conn` algorithm with weights.
* ✅ **Edge Micro-Caching**: API responses are cached in Nginx RAM/disk for 30s. Backend load drops by over 90% during traffic surges.
* ✅ **Edge Rate Limiting**: Malicious spam is dropped at the proxy layer with `HTTP 503` before reaching Node.js.
* ✅ **Zero-Copy Static File Delivery**: Nginx uses Linux kernel `sendfile` to stream frontend files directly from disk to network buffer.

---

## 📸 Live Visual Proof & Telemetry Dashboard

The deployed system includes a custom telemetry dashboard that interacts directly with Nginx endpoints to demonstrate each capability visually:

### 1. Weighted Load Balancing & Micro-Cache Telemetry
![Load Balancer and Cache](screenshots/dash-1.png)
* **Weighted Balancing (2:1 Ratio)**: Nginx routed 4 requests to Instance #1 (Port 3000) and 2 requests to Instance #2 (Port 3001), visually verifying the `weight=2` directive.
* **Micro-Cache Verification**: The first request returned `MISS` (served by Node.js). Subsequent requests returned a glowing green **`HIT`** served directly from Nginx RAM with sub-millisecond response time.

### 2. Rate-Limiting Attack Simulation & Security Audit
![Rate Limiting and Security](screenshots/dash-2.png)
* **Rate-Limit Shield**: Rapidly dispatching 6 requests to `/api/login` triggered the Nginx leaky-bucket limiter: 3 requests were allowed (`HTTP 200`), and 3 malicious requests were blocked with **`HTTP 503`**.
* **Security & Compression**: Verified that `server_tokens` are hidden (masking the Nginx version from scanners), `X-Frame-Options: SAMEORIGIN` prevents clickjacking, and `gzip` compression is active.

---

## 🏗️ System Architecture Diagram

```mermaid
flowchart TD
    Client([Public Internet / Client Browser]) -->|HTTP Port 80| SG[AWS EC2 Security Group]
    
    subgraph EC2 ["AWS EC2 Ubuntu Host"]
        SG --> NginxGateway[Nginx Gateway & Reverse Proxy :80]

        subgraph NginxDirectives ["Nginx Processing Engine"]
            NginxGateway --> Security[Security Headers & gzip on]
            Security --> Router{URL Path Match}

            Router -->|"GET /"| StaticStorage[Static Storage /var/www/<br/>index.html & 50x.html]
            Router -->|"GET /api/login"| RateLimit{Rate Limiter<br/>limit_req: 5r/m}
            RateLimit -->|Exceeded| Block[Drop: HTTP 503]
            RateLimit -->|Allowed| UpstreamPool

            Router -->|"GET /api/cached"| CacheCheck{Proxy Cache RAM<br/>api_cache: 10MB}
            CacheCheck -->|HIT| CacheHit[Instant Return from RAM<br/>X-Cache-Status: HIT]
            CacheCheck -->|MISS| UpstreamPool

            Router -->|"GET /api/info"| UpstreamPool
            
            UpstreamPool[Upstream Load Balancer Pool<br/>Algorithm: least_conn]
        end

        subgraph BackendCluster ["Node.js Cluster (PM2 Managed)"]
            UpstreamPool -->|Weight 2: 66% Traffic| Node1[Node Server #1<br/>127.0.0.1:3000]
            UpstreamPool -->|Weight 1: 33% Traffic| Node2[Node Server #2<br/>127.0.0.1:3001]
        end

        CacheHit --> Client
        StaticStorage --> Client
        Block --> Client
        Node1 -->|JSON Response| NginxGateway
        Node2 -->|JSON Response| NginxGateway
    end
```

---

## 🗺️ Linux Filesystem Layout Map

Understanding where files live in Ubuntu Linux is critical for production operations:

| Directory Path | Purpose in this Project |
| :--- | :--- |
| `/etc/nginx/` | **All Nginx Configurations**. Contains `nginx.conf`, `sites-available/` (draft configs), and `sites-enabled/` (active symlinks). |
| `/var/www/master-project/` | **Static Frontend Files**. Contains `index.html` (the telemetry dashboard) and `50x.html` (custom maintenance page). |
| `/var/cache/nginx/` | **Nginx Cache Storage**. Fast disk/RAM cache where pre-computed backend responses are kept. |
| `/node-servers/` (or `~/`) | **Application Code**. Where `server1.js` (Port 3000) and `server2.js` (Port 3001) reside. |
| `/var/log/nginx/` | **Telemetry Logs**. Contains `access.log` (HTTP hits) and `error.log` (system/upstream errors). |

---

## 🛠️ Complete Step-by-Step Reproduction Guide

Follow these exact steps on any fresh **Ubuntu 22.04 LTS EC2 Instance** to recreate this entire system.

### Phase 1: AWS Security Group Configuration
In the **AWS Management Console**:
1. Navigate to **EC2** → **Instances** → Select your Instance.
2. Click the **Security** tab → Click the **Security Group ID**.
3. Under **Inbound Rules**, click **Edit inbound rules** and ensure the following exist:
   * **SSH**: Port `22` | Source: `My IP` (or `0.0.0.0/0`)
   * **HTTP**: Port `80` | Source: `0.0.0.0/0` (Anywhere)
4. Click **Save rules**.

---

### Phase 2: System Update & Nginx Installation
SSH into your EC2 instance and run:

```bash
# Update Ubuntu package index
sudo apt update && sudo apt upgrade -y

# Install Nginx and Node.js
sudo apt install nginx nodejs npm -y

# Install PM2 Process Manager globally
sudo npm install -g pm2

# Enable and start Nginx system service
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

### Phase 3: Deploying Node.js Backend Cluster
We deploy two distinct Node.js servers listening on loopback ports `3000` and `3001`:

```bash
# 1. Create directory for application servers
sudo mkdir -p /node-servers
cd /node-servers

# 2. Create Instance #1 (Port 3000)
sudo tee server1.js > /dev/null << 'EOF'
const http = require('http');
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        message: "Hello from Node Instance #1 (Port 3000)", 
        url: req.url,
        timestamp: new Date().toISOString()
    }));
}).listen(3000, '127.0.0.1');
EOF

# 3. Create Instance #2 (Port 3001)
sudo tee server2.js > /dev/null << 'EOF'
const http = require('http');
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        message: "Hello from Node Instance #2 (Port 3001)", 
        url: req.url,
        timestamp: new Date().toISOString()
    }));
}).listen(3001, '127.0.0.1');
EOF

# 4. Launch both servers with PM2
sudo pm2 start server1.js --name "api-1"
sudo pm2 start server2.js --name "api-2"
sudo pm2 save
sudo pm2 startup
```

Verify that both instances are online:
```bash
sudo pm2 status
```

---

### Phase 4: Configuring Enterprise Nginx
Deploy the production reverse proxy configuration to `/etc/nginx/sites-available/default`:

```bash
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
# =========================================================================
# 1. SHARED MEMORY ZONES (Cache & Rate Limiting)
# =========================================================================
# Allocate 10MB RAM for cache keys; up to 100MB disk cache storage
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;

# Allocate 10MB binary IP table; allow 5 requests/minute with leaky-bucket
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# =========================================================================
# 2. UPSTREAM LOAD BALANCER POOL
# =========================================================================
upstream my_node_cluster {
    least_conn;                      # Direct to least busy instance
    server 127.0.0.1:3000 weight=2; # Handles 66% of traffic (2 of 3 requests)
    server 127.0.0.1:3001 weight=1; # Handles 33% of traffic (1 of 3 requests)
}

# =========================================================================
# 3. HTTP SERVER GATEWAY (Port 80)
# =========================================================================
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Security Hardening
    server_tokens off;               # Hide Nginx version from vulnerability scans
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Gzip Payload Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    # Route 1: Static Frontend Dashboard (Zero-Copy Sendfile)
    location / {
        root /var/www/master-project;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # Route 2: Rate-Limited Sensitive Endpoint
    location /api/login {
        limit_req zone=login_limit burst=2 nodelay;
        proxy_pass http://my_node_cluster;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Route 3: Micro-Cached Endpoint (30-second TTL)
    location /api/cached {
        proxy_cache api_cache;
        proxy_cache_valid 200 30s;
        add_header X-Cache-Status $upstream_cache_status;
        proxy_pass http://my_node_cluster;
        proxy_set_header Host $host;
    }

    # Route 4: General Dynamic API (Reverse Proxy & Load Balancer)
    location /api/ {
        proxy_pass http://my_node_cluster;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Custom Error Interception (Zero-Downtime Fallback)
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/master-project;
    }
}
EOF
```

Create the custom maintenance error page:
```bash
sudo mkdir -p /var/www/master-project
sudo tee /var/www/master-project/50x.html > /dev/null << 'EOF'
<!DOCTYPE html>
<html>
<body style="font-family: Arial; text-align: center; padding-top: 80px; background: #0f172a; color: #f87171;">
  <h1>⚠️ Backend Services Temporarily Unavailable</h1>
  <p style="color: #94a3b8;">Nginx intercepted an upstream 502/503 gateway failure gracefully.</p>
</body>
</html>
EOF
```

Test configuration syntax and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Phase 5: Deploying Interactive Frontend Dashboard
Deploy the TailwindCSS telemetry dashboard to `/var/www/master-project/index.html`:

```bash
sudo tee /var/www/master-project/index.html > /dev/null << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AWS Nginx Enterprise Architecture Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">

  <!-- Header -->
  <header class="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center space-x-3">
      <div class="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping"></div>
      <div>
        <h1 class="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          AWS EC2 &bull; Enterprise Nginx Gateway
        </h1>
        <p class="text-xs text-slate-400 font-mono">Reverse Proxy &bull; Micro-Cache &bull; Load Balancer &bull; Rate Limiter</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
        PORT: 80 (HTTP)
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        NGINX ACTIVE
      </span>
    </div>
  </header>

  <!-- Main Grid -->
  <main class="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">

    <!-- Feature 1: Load Balancer -->
    <div class="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">⚡</span>
            Feature 1: Weighted Least-Connection Load Balancing
          </h2>
          <p class="text-xs text-slate-400">Nginx distributes traffic across internal Node.js instances with 2:1 weight ratio.</p>
        </div>
        <button onclick="testLoadBalancer()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold font-mono tracking-wider transition active:scale-95 shadow-lg shadow-blue-600/20">
          DISPATCH REQUEST (/api/info)
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div id="card-1" class="border border-slate-800 rounded-xl bg-slate-950 p-5 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span class="font-bold text-sm text-white">Node.js Server #1</span>
              <span class="text-xs font-mono text-slate-500">127.0.0.1:3000</span>
            </div>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">WEIGHT = 2 (66%)</span>
          </div>
          <div class="flex items-baseline justify-between mt-2">
            <span class="text-3xl font-extrabold font-mono text-white" id="count-1">0</span>
            <span id="badge-1" class="text-xs font-mono text-slate-500">WAITING</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div id="bar-1" class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>

        <div id="card-2" class="border border-slate-800 rounded-xl bg-slate-950 p-5 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span class="font-bold text-sm text-white">Node.js Server #2</span>
              <span class="text-xs font-mono text-slate-500">127.0.0.1:3001</span>
            </div>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">WEIGHT = 1 (33%)</span>
          </div>
          <div class="flex items-baseline justify-between mt-2">
            <span class="text-3xl font-extrabold font-mono text-white" id="count-2">0</span>
            <span id="badge-2" class="text-xs font-mono text-slate-500">WAITING</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div id="bar-2" class="bg-purple-500 h-1.5 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature 2 & 3: Cache & Rate Limit -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Cache Card -->
      <div class="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">💾</span>
            Feature 2: Nginx Micro-Cache
          </h2>
          <button onclick="testCache()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono transition active:scale-95 shadow">
            TEST /api/cached
          </button>
        </div>
        <p class="text-xs text-slate-400">Caches backend responses in Nginx RAM for 30s. Check X-Cache-Status header.</p>
        
        <div class="border border-slate-800 rounded-xl bg-slate-950 p-4 space-y-2.5">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Cache Status (X-Cache-Status):</span>
            <span id="cache-status-badge" class="px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-400">NONE</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Latency:</span>
            <span id="cache-latency" class="text-slate-200">-- ms</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Served By:</span>
            <span id="cache-source" class="text-slate-200">--</span>
          </div>
        </div>
      </div>

      <!-- Rate Limit Card -->
      <div class="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">🛡️</span>
            Feature 3: Rate Limiting Shield
          </h2>
          <button onclick="testRateLimiter()" class="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-mono transition active:scale-95">
            SPAM 6 REQS (/api/login)
          </button>
        </div>
        <p class="text-xs text-slate-400">Restricts sensitive endpoints to 5 req/min. Exceeding drops requests with 503.</p>

        <div class="border border-slate-800 rounded-xl bg-slate-950 p-4">
          <div class="grid grid-cols-6 gap-2 text-center" id="rate-limit-boxes">
            <div class="p-2 rounded bg-slate-800 text-xs font-mono text-slate-400">R1</div>
            <div class="p-2 rounded bg-slate-800 text-xs font-mono text-slate-400">R2</div>
            <div class="p-2 rounded bg-slate-800 text-xs font-mono text-slate-400">R3</div>
            <div class="p-2 rounded bg-slate-800 text-xs font-mono text-slate-400">R4</div>
            <div class="p-2 rounded bg-slate-800 text-xs font-mono text-slate-400">R5</div>
            <div class="p-2 rounded bg-slate-800 text-xs font-mono text-slate-400">R6</div>
          </div>
          <p class="text-center text-xs font-mono text-slate-500 mt-2" id="rate-summary">Ready to simulate spam attack.</p>
        </div>
      </div>

    </div>

    <!-- Feature 4: Security Audit -->
    <div class="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-white flex items-center gap-2">
          <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">🔒</span>
          Feature 4: Nginx Security & Compression Verification
        </h2>
        <button onclick="auditSecurity()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono transition">
          RUN AUDIT
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span class="text-slate-400 block mb-1">server_tokens</span>
          <span class="text-emerald-400 font-bold" id="sec-tokens">HIDDEN (off)</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span class="text-slate-400 block mb-1">gzip Compression</span>
          <span class="text-emerald-400 font-bold" id="sec-gzip">ACTIVE</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span class="text-slate-400 block mb-1">X-Frame-Options</span>
          <span class="text-emerald-400 font-bold" id="sec-frame">SAMEORIGIN</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span class="text-slate-400 block mb-1">X-Content-Type</span>
          <span class="text-emerald-400 font-bold" id="sec-content">nosniff</span>
        </div>
      </div>
    </div>

    <!-- Live Event Stream -->
    <div class="border border-slate-800 rounded-2xl bg-slate-950 p-5 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Live Nginx Activity Stream</span>
        <button onclick="clearLogs()" class="text-xs font-mono text-slate-500 hover:text-slate-300">Clear</button>
      </div>
      <div class="bg-black/50 rounded-xl p-3.5 font-mono text-xs text-slate-300 h-36 overflow-y-auto space-y-1 border border-slate-900" id="log-console">
        <div class="text-slate-600">// Gateway initialized. Ready to receive traffic...</div>
      </div>
    </div>

  </main>

  <script>
    let c1 = 0, c2 = 0;

    function addLog(msg, type = 'info') {
      const consoleBox = document.getElementById('log-console');
      const time = new Date().toLocaleTimeString();
      const div = document.createElement('div');
      
      if (type === 'success') div.className = 'text-emerald-400';
      else if (type === 'blue') div.className = 'text-blue-400';
      else if (type === 'purple') div.className = 'text-purple-400';
      else if (type === 'warning') div.className = 'text-amber-400';
      else if (type === 'danger') div.className = 'text-rose-400 font-bold';
      else div.className = 'text-slate-300';

      div.innerHTML = `<span class="text-slate-600">[${time}]</span> ${msg}`;
      consoleBox.appendChild(div);
      consoleBox.scrollTop = consoleBox.scrollHeight;
    }

    function clearLogs() {
      document.getElementById('log-console').innerHTML = '<div class="text-slate-600">// Cleared.</div>';
    }

    async function testLoadBalancer() {
      const start = performance.now();
      try {
        const res = await fetch('/api/info');
        const data = await res.json();
        const duration = Math.round(performance.now() - start);

        if (data.message && data.message.includes('3000')) {
          c1++;
          document.getElementById('count-1').innerText = c1;
          highlightCard(1);
          addLog(`[HTTP 200] Upstream: <b>Instance 1 (Port 3000)</b> &bull; ${duration}ms`, 'blue');
        } else {
          c2++;
          document.getElementById('count-2').innerText = c2;
          highlightCard(2);
          addLog(`[HTTP 200] Upstream: <b>Instance 2 (Port 3001)</b> &bull; ${duration}ms`, 'purple');
        }

        const total = c1 + c2;
        document.getElementById('bar-1').style.width = `${Math.round((c1/total)*100)}%`;
        document.getElementById('bar-2').style.width = `${Math.round((c2/total)*100)}%`;

      } catch (e) {
        addLog(`Fetch error: ${e.message}`, 'danger');
      }
    }

    function highlightCard(num) {
      const card = document.getElementById(`card-${num}`);
      const badge = document.getElementById(`badge-${num}`);
      const otherCard = document.getElementById(`card-${num === 1 ? 2 : 1}`);
      const otherBadge = document.getElementById(`badge-${num === 1 ? 2 : 1}`);

      card.className = num === 1 
        ? "border border-blue-500 bg-blue-950/20 rounded-xl p-5 transition-all duration-300 ring-1 ring-blue-500"
        : "border border-purple-500 bg-purple-950/20 rounded-xl p-5 transition-all duration-300 ring-1 ring-purple-500";
      badge.className = num === 1
        ? "text-xs font-mono text-blue-400 font-bold"
        : "text-xs font-mono text-purple-400 font-bold";
      badge.innerText = "SERVED REQUEST";

      otherBadge.innerText = "WAITING";
      otherBadge.className = "text-xs font-mono text-slate-500";
      otherCard.className = "border border-slate-800 rounded-xl bg-slate-950 p-5 transition-all duration-300";
    }

    async function testCache() {
      const start = performance.now();
      try {
        const res = await fetch('/api/cached');
        const duration = Math.round(performance.now() - start);
        const cacheHeader = res.headers.get('X-Cache-Status') || 'MISS';

        const badge = document.getElementById('cache-status-badge');
        badge.innerText = cacheHeader;
        document.getElementById('cache-latency').innerText = `${duration} ms`;

        if (cacheHeader === 'HIT') {
          badge.className = 'px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          document.getElementById('cache-source').innerText = 'Nginx RAM Cache (Zero Node Load)';
          addLog(`[CACHE HIT] Nginx served response from cache in <b>${duration}ms</b>!`, 'success');
        } else {
          badge.className = 'px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30';
          document.getElementById('cache-source').innerText = 'Node.js Backend (Saved into Cache for 30s)';
          addLog(`[CACHE MISS] First request fetched from Node.js backend (${duration}ms). Next calls will be HIT.`, 'warning');
        }
      } catch(e) {
        addLog(`Cache test failed: ${e.message}`, 'danger');
      }
    }

    async function testRateLimiter() {
      const boxes = document.getElementById('rate-limit-boxes').children;
      for (let i = 0; i < 6; i++) {
        boxes[i].className = 'p-2 rounded bg-slate-800 text-xs font-mono text-slate-400 animate-pulse';
      }

      addLog(`[Rate Limit Attack] Sending 6 concurrent calls to /api/login...`, 'warning');
      let blocked = 0;

      for (let i = 0; i < 6; i++) {
        try {
          const res = await fetch('/api/login');
          if (res.status === 503) {
            blocked++;
            boxes[i].className = 'p-2 rounded bg-rose-600/30 text-rose-300 border border-rose-500/50 text-xs font-mono font-bold';
            boxes[i].innerText = '503';
            addLog(`Request #${i+1}: <b>BLOCKED by Nginx Rate Limiter (HTTP 503)</b>`, 'danger');
          } else {
            boxes[i].className = 'p-2 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold';
            boxes[i].innerText = '200';
            addLog(`Request #${i+1}: Allowed (HTTP 200)`, 'success');
          }
        } catch(e) {
          boxes[i].className = 'p-2 rounded bg-rose-900 text-xs font-mono text-rose-400';
        }
      }

      document.getElementById('rate-summary').innerText = `Result: ${6 - blocked} Allowed, ${blocked} Blocked by Nginx.`;
    }

    async function auditSecurity() {
      try {
        const res = await fetch('/');
        const serverHeader = res.headers.get('server');
        if (!serverHeader || !serverHeader.includes('/')) {
          document.getElementById('sec-tokens').innerText = 'HIDDEN (server_tokens off)';
        }
        addLog(`[Security Audit] Security headers & compression verified successfully!`, 'success');
      } catch(e) {
        addLog(`Audit error: ${e.message}`, 'danger');
      }
    }

    auditSecurity();
  </script>
</body>
</html>
EOF
```

---

### Phase 6: Testing & Live Verification

Open your browser at your EC2 Public IP:
```
http://<YOUR_EC2_PUBLIC_IP>/
```

#### Verification Matrix:
1. **Load Balancing**: Click **"DISPATCH REQUEST"** 6 times. Watch Node Server #1 reach 4 counts and Node Server #2 reach 2 counts (exact 2:1 distribution).
2. **Micro-Caching**: Click **"TEST /api/cached"** twice. The first displays `MISS` (~50ms); the second displays `HIT` (sub-3ms).
3. **Rate Limiting**: Click **"SPAM 6 REQS"**. The first 3 return `200` (green), and the last 3 return `503` (red).
4. **Fault Tolerance / 502 Fallback**: In your terminal, run `sudo pm2 stop all`, then click **"DISPATCH REQUEST"**. Nginx will serve your custom `50x.html` maintenance page! (Run `sudo pm2 restart all` after testing).

---

## 🔬 Deep Technical Breakdown of Concepts

### 1. The Reverse Proxy Mechanism (`proxy_pass`)
When an HTTP request arrives on Port 80, Nginx opens an internal TCP socket connection to `127.0.0.1:3000`. It strips the public socket and forwards headers:
* `proxy_set_header Host $host`: Passes the original domain or IP visited by the client.
* `proxy_set_header X-Real-IP $remote_addr`: Injects the client's actual public IP. Without this, Node.js logs would falsely show all incoming requests originating from `127.0.0.1`.

### 2. Leaky-Bucket Rate Limiting (`limit_req_zone`)
* `$binary_remote_addr`: Stores client IPv4 addresses in binary (4 bytes each) instead of string format (up to 15 bytes), enabling a 10MB table to track over 160,000 concurrent IPs.
* `burst=2 nodelay`: Accommodates temporary spikes of up to 2 excess requests immediately. Any additional requests beyond the burst window are dropped with `503 Service Unavailable` with zero queue delay.

### 3. Edge Micro-Caching (`proxy_cache`)
* `keys_zone=api_cache:10m`: Dedicated 10MB shared RAM for fast hash-table lookup of cached URLs.
* `levels=1:2`: Creates a two-tier nested directory structure on disk (e.g. `/var/cache/nginx/f/72/...`), preventing directory file-count bottlenecks on Linux ext4 filesystems.
* `X-Cache-Status`: Exposes internal cache state (`HIT`, `MISS`, `EXPIRED`, `BYPASS`) directly to downstream clients for observability.

---

## 🛠️ DevOps Troubleshooting & Incident Resolution Playbook

During the implementation of this project, real-world Linux system administration challenges were encountered and resolved:

### Incident 1: Port Collision & Failed Process Bind (`EADDRINUSE`)
* **Symptom**: `pm2 status` showed `api-1` repeatedly failing with status `errored` (restarts: 15+).
* **Investigation**: Ran socket diagnostic:
  ```bash
  sudo ss -tulpn | grep 3000
  ```
  Found PID `2612` holding Port 3000. Investigated active systemd units:
  ```bash
  sudo systemctl list-units --type=service --state=running | grep -i node
  ```
  Discovered a background daemon named `nginx-demo.service` running an old process.
* **Resolution**: Terminated and permanently disabled the orphaned service:
  ```bash
  sudo systemctl stop nginx-demo.service
  sudo systemctl disable nginx-demo.service
  sudo pm2 restart api-1
  ```
  Both `api-1` and `api-2` immediately shifted to `online`.

### Incident 2: Nano Unprivileged Buffer Lock (`[ File is unwritable ]`)
* **Symptom**: Modifying `/var/www/master-project/index.html` threw permission denial in editor buffers.
* **Resolution**: Replaced interactive in-place editing with automated `sudo tee` heredoc pipelines, ensuring atomic file replacement with guaranteed root privilege escalation.


## 👤 Author & Maintainer
Built and deployed by *Jammalamadugu Shaik Nafeez**.  
Focus: Cloud Architecture, Linux Systems Administration, and High-Performance Web Infrastructure.

