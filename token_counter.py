#!/usr/bin/env python3
"""
Token Counter Script using OpenAI's tiktoken library
Usage: python token_counter.py [file_path] [--model MODEL_NAME]
"""

import argparse
import sys
import tiktoken
from pathlib import Path


def count_tokens(text, model="gpt-4"):
    """Count tokens in text using specified model's tokenizer."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        print(f"Error: Model '{model}' not supported. Using cl100k_base encoding.")
        encoding = tiktoken.get_encoding("cl100k_base")
    
    tokens = encoding.encode(text)
    return len(tokens)


def main():
    parser = argparse.ArgumentParser(
        description="Count tokens in a text file using OpenAI's tiktoken library"
    )
    parser.add_argument(
        "file_path", 
        nargs="?", 
        help="Path to the text file (if not provided, reads from stdin)"
    )
    parser.add_argument(
        "--model", 
        "-m", 
        default="gpt-4",
        help="Model to use for tokenization (default: gpt-4)"
    )
    parser.add_argument(
        "--verbose", 
        "-v", 
        action="store_true",
        help="Show additional details"
    )
    
    args = parser.parse_args()
    
    # Read text from file or stdin
    try:
        if args.file_path:
            file_path = Path(args.file_path)
            if not file_path.exists():
                print(f"Error: File '{args.file_path}' not found.", file=sys.stderr)
                sys.exit(1)
            
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            if args.verbose:
                print(f"File: {args.file_path}")
        else:
            # Read from stdin
            text = sys.stdin.read()
            if args.verbose:
                print("Reading from stdin...")
    
    except UnicodeDecodeError:
        print("Error: Could not decode file as UTF-8.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        sys.exit(1)
    
    if not text.strip():
        print("Warning: Input is empty or contains only whitespace.")
        print("Token count: 0")
        return
    
    # Count tokens
    token_count = count_tokens(text, args.model)
    
    if args.verbose:
        print(f"Model: {args.model}")
        print(f"Characters: {len(text):,}")
        print(f"Words (approx): {len(text.split()):,}")
        print(f"Token count: {token_count:,}")
    else:
        print(token_count)


if __name__ == "__main__":
    main()
