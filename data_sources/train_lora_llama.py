#!/usr/bin/env python3
"""
Instruction-style LoRA fine-tuning for LLaMA 3.1 8B
Requirements: Python >=3.10, PyTorch >=2.0
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments, DataCollatorForSeq2Seq
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, TaskType

# ------------------------------
# 1. Model & Tokenizer
# ------------------------------
model_name = "meta-llama/Llama-3.1-8B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# Load 8-bit model to save VRAM
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    load_in_8bit=True
)

# ------------------------------
# 2. Add LoRA
# ------------------------------
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)
model = get_peft_model(model, lora_config)

# Optional compile
if torch.__version__ >= "2.0":
    model = torch.compile(model)

# ------------------------------
# 3. Load Dataset
# ------------------------------
dataset_path = "finetune_ready.jsonl"
dataset = load_dataset("json", data_files={"train": dataset_path})

def tokenize_fn(example):
    # Combine prompt + completion
    full_text = example["prompt"] + example["completion"]
    tokenized = tokenizer(
        full_text,
        truncation=True,
        max_length=512,
        padding="max_length"
    )
    # Labels = copy of input_ids (for causal LM)
    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized

tokenized_ds = dataset["train"].map(tokenize_fn, batched=False)
train_dataset = tokenized_ds

# ------------------------------
# 4. Training Arguments
# ------------------------------
training_args = TrainingArguments(
    output_dir="checkpoints/lora_llama_sft",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,
    num_train_epochs=3,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_steps=500,
    save_total_limit=2,
    optim="paged_adamw_8bit",
    report_to="none"
)

# ------------------------------
# 5. Trainer
# ------------------------------
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset
)

# ------------------------------
# 6. Train
# ------------------------------
trainer.train()

# ------------------------------
# 7. Save LoRA adapter
# ------------------------------
model.save_pretrained("checkpoints/lora_llama_sft")
tokenizer.save_pretrained("checkpoints/lora_llama_sft")
print("LoRA SFT training complete!")
