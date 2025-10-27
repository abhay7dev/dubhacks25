from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
from meta_prompt_2 import meta_prompt_2  # Make sure this is a string template
import torch

# === Load Model ===
base_model_path = "llama3_3B"
lora_path = "lora_llama_sft"

tokenizer = AutoTokenizer.from_pretrained(base_model_path)
model = AutoModelForCausalLM.from_pretrained(
    base_model_path,
    torch_dtype=torch.float16,
    device_map="auto"
)
model = PeftModel.from_pretrained(model, lora_path)
model.eval()

# === Define API ===
app = FastAPI()

# Input schema
class UserInput(BaseModel):
    desired_job: str
    student: str = ""  # optional
    skills: str
    job_experience: str
    clubs: str
    projects: str

@app.get("/")
def normal():
    return "hi"

@app.post("/generate")
async def generate_recommendations(user: UserInput):
    # Fill in the prompt template
    prompt = (
        meta_prompt_2
        .replace("{{desired_job}}", user.desired_job)
        .replace("{{skills}}", user.skills)
        .replace("{{job_experience}}", user.job_experience)
        .replace("{{clubs}}", user.clubs)
        .replace("{{projects}}", user.projects)
    )

    # Tokenize and run model
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=5000,
        do_sample=True,
        temperature=0.3,
        top_p=0.9,
        repetition_penalty=1.2,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.eos_token_id,
    )

    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(result)
    return {"output": result}
