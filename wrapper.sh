#!/bin/bash
# Wrapper script for EnumMenum

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain>"
    exit 1
fi

# Logic to check for subenum in system paths (as requested)
if [ -x "/usr/bin/subenum" ]; then
    SUBENUM="/usr/bin/subenum"
elif [ -f "/usr/bin/subenum" ]; then
    # In case it's not executable but exists (unlikely for bin, but safe)
    SUBENUM="/usr/bin/subenum"
    chmod +x "$SUBENUM"
elif [ -x "/usr/local/bin/subenum" ]; then
    SUBENUM="/usr/local/bin/subenum"
elif [ -f "/usr/local/bin/subenum" ]; then
     SUBENUM="/usr/local/bin/subenum"
     chmod +x "$SUBENUM"
else
    echo "[-] subenum tool not found in /usr/bin/ or /usr/local/bin/."
    echo "[-] Please install it as per the guide: https://github.com/bing0o/SubEnum" 
    exit 1
fi

echo "[*] Using subenum from: $SUBENUM"
echo "[*] Starting enumeration for $DOMAIN..."

# Create results directory
mkdir -p results

# Run subenum
# Using -s (silent) to get clean list
$SUBENUM -d "$DOMAIN" -s -o "results/${DOMAIN}_subdomains.txt"

if [ ! -s "results/${DOMAIN}_subdomains.txt" ]; then
    echo "[-] subenum failed to find subdomains or tool execution failed."
    exit 1
fi

echo "[*] subenum completed. Found $(wc -l < "results/${DOMAIN}_subdomains.txt") subdomains."
echo "[*] Running httpx for detailed enumeration..."

if command -v httpx &> /dev/null; then
    # Run httpx on the results
    # flags: -title -tech-detect -status-code -ip -cname -content-length -web-server -content-type -json
    cat "results/${DOMAIN}_subdomains.txt" | httpx -title -tech-detect -status-code -ip -cname -content-length -web-server -content-type -json -o "${DOMAIN}_results.json"
    
    echo "[+] Done! Results saved to: ${PWD}/${DOMAIN}_results.json"
    echo "[+] Upload this file to the EnumMenum Viewer."
else
    echo "[-] httpx not found! Please install httpx to generate the JSON report."
fi

else
    echo "[-] httpx not found. Please install httpx (projectdiscovery/httpx)."
    exit 1
fi
