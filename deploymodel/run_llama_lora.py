from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
from meta_prompt import meta_prompt
from meta_prompt_2 import meta_prompt_2
import torch

# Paths to your model directories
base_model_path = "llama3_3B"
lora_path = "lora_llama_sft"

# Load tokenizer and base model
tokenizer = AutoTokenizer.from_pretrained(base_model_path)
model = AutoModelForCausalLM.from_pretrained(
    base_model_path,
    torch_dtype=torch.float16,         # This is important!
    device_map="auto"                  # This tells Transformers to use the GPU
)


# Load LoRA adapters
model = PeftModel.from_pretrained(model, lora_path)
# input = """{
#   "school": "University of Washington",
#   "major": "Computer Science",
#   "desiredOccupation": "Software Engineer",
#   "interests": ["Coding", "AI/ML"],
#   "experiences": ["Intern at startup", "SW Club Treasurer"],
#   "skills": ["Python", "JS and Node", "PyTorch"],
#   "projects": ["Custom LLM", "Full Stack Web App"],
#   "clubs": ["Software Career Club"]
# }"""

# # Inference prompt
# prompt = (
#     meta_prompt.replace("{{ $json.attributes.userInput }}", input)
# )

# Example values
desired_job = "Machine Learning Engineer"
student = "University of Washington"
skills = "Python, TensorFlow, PyTorch"
job_experience = "Interned at NVIDIA, TA for ML class"
clubs = "AI Club, Data Science Society"
projects = "Image classifier, NLP chatbot"

# Fill the placeholders
prompt = (
    meta_prompt_2
    .replace("{{desired_job}}", desired_job)
    .replace("{{skills}}", skills)
    .replace("{{job_experience}}", job_experience)
    .replace("{{clubs}}", clubs)
    .replace("{{projects}}", projects)
)


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

print("\n\n")
print(tokenizer.decode(outputs[0], skip_special_tokens=True))

# Decode and print the result
