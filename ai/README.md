# signswft-ai

Run the LLM Agent

```
sudo docker run --gpus all \
    -e HF_TOKEN=<HF_TOKEN> -p 8000:8000 \
    ghcr.io/mistralai/mistral-src/vllm:latest \
    --host 0.0.0.0 \
    --model mistralai/Mistral-7B-Instruct-v0.2
```

Run API

```
python api.py
```