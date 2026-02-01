<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-cyan?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/platform-Linux-green?style=for-the-badge&logo=linux" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-orange?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/react-18-blue?style=for-the-badge&logo=react" alt="React">
</p>

<h1 align="center">
  <br>
  🌐 EnumMenum
  <br>
</h1>

<h4 align="center">
  <i>Visualize your recon data. Offline. Secure. Modern.</i>
</h4>

<p align="center">
  A static, offline-first dashboard for visualizing subdomain enumeration and technology stack analysis results from tools like <b>SubEnum</b>, <b>httpx</b>, and <b>WhatWeb</b>.
</p>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **Offline First** | All data is processed locally in your browser. No data leaves your machine. |
| 📊 **Visual Dashboard** | Charts for Status Codes, Technology Headers, and CDN usage. |
| ⚡ **Tech Stack Analysis** | Detailed breakdown of detected technologies via **WhatWeb** integration. |
| 🔍 **Advanced Filtering** | Filter results by status code (2xx, 3xx, 4xx, 5xx). |
| 📂 **Multi-Format Support** | Supports `httpx` (JSON) and `whatweb` (JSON) outputs. |
| 🛠️ **Command Generator** | Built-in helper to generate the exact CLI commands needed for perfect results. |
| 🌗 **Dark Mode** | Sleek, cyber-security focused dark interface. |

---

## 🛠️ Prerequisites & Dependencies

To generate the data files that **EnumMenum** visualizes, you must have the following tools installed on your Linux machine (Kali/Parrot recommended):

### 1. The Enumeration Script
*   **SubEnum**: The core enumeration wrapper script (included in this repo).

### 2. Required CLI Tools
Ensure these are installed and in your system `$PATH`:

| Tool | Purpose | Installation |
|------|---------|--------------|
| **httpx** | Probing domains & JSON generation | `go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest` |
| **whatweb** | Technology stack identification | `sudo apt install whatweb` (Kali) |
| **jq** | JSON processing for piping | `sudo apt install jq` |

### 3. SubEnum Dependencies (Backend)
The `subenum.sh` script relies on these underlying scanners:
*   `findomain`
*   `subfinder`
*   `amass`
*   `assetfinder`
*   `anew`
*   `parallel`
*   `dnsx`

> 💡 **Tip:** You can usually install most of these via `apt install` on Kali Linux or using `go install`.

---

## 🚀 Quick Start

### 1. Hosting the Viewer
EnumMenum is a static web app. You can run it locally or host it on GitHub Pages.

**Run Locally:**
```bash
cd ui
npm install
npm run dev
# Open http://localhost:5173
```

**Access Live:**
> [Click here to open the Live Viewer](https://Muhammad-Hassan31144.github.io/EnumMenum/)

### 2. Generating Data
Use the **Command Generator** inside the app, or run the command manually:

**For a Single Domain:**
```bash
subenum -d example.com -s | httpx -title -tech-detect -status-code -ip -cname -content-length -web-server -content-type -json -o example.com_results.json && \
cat example.com_results.json | jq -r '.url' | whatweb -i /dev/stdin -a 3 --log-json=example.com_whatweb.json
```

**For a List of Domains:**
```bash
subenum -l domains.txt -s | httpx -title -tech-detect -status-code -ip -cname -content-length -web-server -content-type -json -o domains_results.json && \
cat domains_results.json | jq -r '.url' | whatweb -i /dev/stdin -a 3 --log-json=domains_whatweb.json
```

### 3. Analyzing Results
1. Open **EnumMenum** in your browser.
2. Drag & Drop `example.com_results.json` (httpx output) to see the **Dashboard**.
3. Drag & Drop `example.com_whatweb.json` (whatweb output) to populate the **WhatWeb** tab.

---


## ⚠️ Disclaimer

<table>
<tr>
<td>

### 🚨 IMPORTANT: READ BEFORE USE

**EnumMenum** and its components are designed for **authorized security auditing**, **bug bounty programs**, and **system administration** purposes only.

#### ✅ Authorized Use
- Auditing your own infrastructure
- Participating in authorized Bug Bounty programs
- Educational purposes in controlled environments

#### ❌ Prohibited Use
- Scanning systems without explicit permission
- Any malicious or illegal activities

#### ⚖️ Legal Notice

> **By using this tool, you acknowledge and agree that:**
>
> 1. You have **explicit authorization** to run scans on the target system(s)
> 2. The developer(s) assume **NO responsibility** for misuse or damage caused by this tool
> 3. This tool is provided **"AS IS"** without warranty of any kind

**Fair and ethical usage is strongly encouraged.**

</td>
</tr>
</table>

---

## 📜 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 EnumMenum

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  <b>EnumMenum</b> - Visualize your Recon.
  <br><br>
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-disclaimer">Disclaimer</a>
</p>

<p align="center">
  Made with ❤️ for the security community
</p>
