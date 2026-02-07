# Product Management System

A serverless product management infrastructure built with AWS CDK and TypeScript, demonstrating cloud architecture, Infrastructure-as-Code (IaC), and modern AWS services.

## Overview

This project demonstrates a AWS cloud infrastructure for building scalable, type-safe backend systems. The application leverages AWS Lambda, DynamoDB, S3, and AWS CDK to create a product management platform where users can create, retrieve and delete products.

## Key Features

- **Serverless Architecture**: Fully managed AWS services with no infrastructure overhead
- **Type-Safe Infrastructure**: AWS CDK with TypeScript for compile-time safety
- **Data Persistence**: DynamoDB for scalable NoSQL data storage
- **Object Storage**: S3 integration for image storage
- **Lambda Functions**: Event-driven compute for product operations

## Tech Stack

### Language & Framework
- **TypeScript**
- **AWS CDK**


## Getting Started

### Prerequisites
- Node.js 18+ or later
- npm or yarn
- AWS Account credentials

### Installation

```bash
# Clone the repository
- Clone the reposiory and navigate to the directory

# Install dependencies
npm install

# Deploy to AWS
npx cdk deploy