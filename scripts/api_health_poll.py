import requests, time, sys
URL = "https://api.anthropic.com/v1/messages"
while True:
    try:
        r = requests.post(URL, json={"model":"claude-3-5-haiku-latest","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}, timeout=20)
        print(f"{time.strftime('%H:%M:%S')} status={r.status_code}")
        if r.status_code in (200, 405):
            print("API_HEALTHY")
            break
        sys.exit(0 if r.status_code == 405 else 2)
    except Exception as e:
        print(f"{time.strftime('%H:%M:%S')} FAIL {e}")
    time.sleep(120)
