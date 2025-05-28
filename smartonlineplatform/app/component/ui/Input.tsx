"use client";
import { error } from 'console';
import { Span } from 'next/dist/trace';
import React from 'react'
import { Eye, EyeClosed, EyeOff, User } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { on } from 'events';
export type ErrorType = {
  characterLimit?: {
    min: number;
    max: number;
  };
  notEmpty?: boolean;
  onlyNumbers?: boolean;
  onlyLetters?: boolean;
  NoSpecailcharaterType?:string
  emailValidation?: boolean;
}
type InputProps = {
  IconClassName?: string;
  errorClassName?: string;
  inputClassName?: string;
  icon?:React.ReactNode;
  placeholder?: string;
  value?: string;
  OnChange?: (value: string) => void;
  className?: string;
  labelText?: string;
  error: {
    message?: string[];
    type?: ErrorType;
  } | null;
  
} & React.InputHTMLAttributes<HTMLInputElement>;

function validateInput(input: string, rules: ErrorType): string[] {
  console.log("Validating input:", input, "with rules:", rules);
  const errors: string[] = [];

  // Check for empty string
  if (rules.notEmpty && input.trim() === "") {
    errors.push("Input should not be empty.");
  }

  // Check character length
  if (rules.characterLimit) {
    const { min, max } = rules.characterLimit;
    if (input.length < min) {
      errors.push(`Input should be at least ${min} characters long.`);
    }
    if (input.length > max) {
      errors.push(`Input should not exceed ${max} characters.`);
    }
  }

  // Check only numbers
  if (rules.onlyNumbers && !/^\d+$/.test(input)) {
    errors.push("Input should contain only numbers.");
  }

  // Check only letters
  if (rules.onlyLetters && !/^[a-zA-Z]+$/.test(input)) {
    errors.push("Input should contain only letters.");
  }

  // Check for no special characters (excluding pattern)
  if (rules.NoSpecailcharaterType) {
    const regex = new RegExp(rules.NoSpecailcharaterType);
    if (regex.test(input)) {
      errors.push("Input contains disallowed special characters.");
    }
    
  }
  // ← Email format check
  if (rules.emailValidation) {
  const raw = input;
  const value = input.trim().toLowerCase();

  console.log("Validating email format for input:", `"${raw}"`, "→ after trim/lower:", `"${value}"`);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ok = emailRegex.test(value);
  console.log("  → regex.test result:", ok);

  if (!ok) {
    errors.push("Invalid email format.");
  } else {
    console.log("Input is valid for emailValidation rule.");
  }
}


  return errors;
}
const Input = ({className,inputClassName,icon,IconClassName,error,OnChange,...props}:InputProps) => {
  const [errorMessages, setErrorMessages] = React.useState<string[]>(error?.message || []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if(validateInput(value, error?.type || props.type == "email" ? {emailValidation:true}:{}).length > 0) {
      
        setErrorMessages(validateInput(value, error?.type || props.type == "email" ? {emailValidation:true}:{}));
      
      return;
    }
  OnChange && OnChange(value);
    setErrorMessages([]);
  }
  const [type, setType] = React.useState(props.type || "text");
  return (
    <>
      <div className="flex  h-fit  w-full rounded-md items-end justify-between  border-input border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
        <div className="gap-4 flex items-center w-full">
          <div className={cn(IconClassName)}>{icon}</div>
        <input onChange={handleChange} className={cn('outline-none bg-transparent h-5',inputClassName)} {...props} type={props.type ? props.type == "password" ? type : props.type : type} />
        </div>
        {props.type && props.type === "password" && type === "password" ? (<div onClick={() => setType("text")} className={cn(IconClassName)}><EyeOff/></div>) : props.type && props.type === "password" && type === "text" ? (<div className={cn(IconClassName)} onClick={() => setType("password")}><Eye/></div>) : null}
      </div>
        {errorMessages.length > 0 && errorMessages.map((message, index) => (
          <span key={index} className={cn("text-red-600 flex items-center  text-xs", error?.type?.characterLimit ? "mt-1" : "mt-2")}>
            <div className="!size-2 bg-red-600 rounded-full"></div>
            <span className="ml-2">{message}</span>
          </span>
        ))}
        </>
  )
}

export default Input