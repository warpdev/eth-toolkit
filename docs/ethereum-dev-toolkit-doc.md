# Ethereum Developer Toolkit Web Service Development Document

## Project Overview

A web-based platform providing various utility tools for Ethereum developers. At the MVP stage, the focus is on developing a Calldata Encoder/Decoder to help Ethereum developers perform smart contract development and debugging tasks more intuitively and efficiently.

## Target Users and Problem Definition

- **Target Users**: Ethereum developers of all levels, from beginners to advanced
- **Problem Addressed**:
  - Simplifying the complex process of decoding Ethereum transaction Calldata
  - Automating Calldata generation for smart contract function calls
  - Streamlining the developer debugging process

## Core Feature Specifications (MVP)

### 1. Calldata Decoder

- **Feature Description**: Decode Ethereum transaction Calldata hex strings into human-readable format
- **Detailed Functions**:
  - Input Calldata via copy/paste
  - Automatic separation and display of function signatures and parameter values
  - Intuitive visualization of function names, parameter names, types, and values
  - Function signature decoding using 4bytes API even without ABI
    - Extract the first 4 bytes from transaction data and query the 4bytes database
    - Display possible function signatures based on the 4 bytes
    - Show all options when multiple signatures exist
  - More detailed parameter decoding when ABI is provided

### 2. Calldata Encoder

- **Feature Description**: Generate valid Calldata when a smart contract function and parameters are inputted
- **Detailed Functions**:
  - Interface for entering smart contract function names and types
  - Dynamic generation of input forms matching parameter types
  - Copy button for generated Calldata
  - Detailed explanation of encoding process (for educational purposes)

### 3. Data Storage Functionality

- **Feature Description**: Save frequently used Calldata or ABIs for reuse
- **Detailed Functions**:
  - Local storage using browser's IndexedDB
  - View, edit, and delete saved items
  - Naming and tagging functionality

## User Journey Map

### Scenario 1: Calldata Decoding

1. User visits the website
2. Selects the Calldata decoder tab
3. Inputs Calldata copied from an Ethereum transaction
4. (Optional) Inputs ABI or selects a saved ABI
5. Clicks the decode button
6. Views decoded function name and parameters
7. (Optional) Saves the result

### Scenario 2: Calldata Encoding

1. User visits the website
2. Selects the Calldata encoder tab
3. Defines function name and parameter types (ABI format)
4. Inputs parameter values
5. Clicks the encode button
6. Views and copies the generated Calldata
7. (Optional) Saves the result

## Technology Stack

### Frontend

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **State Management**: jotai
- **Web3 Library**: viem
- **Local Storage**: IndexedDB (using idb library)

### Backend

- No separate backend server required for initial MVP
- All logic processed client-side

### Database

- Browser's IndexedDB for local data storage
- Storage structure:
  ```
  {
    savedItems: [
      {
        id: string,
        name: string,
        type: 'calldata' | 'abi',
        content: string,
        tags: string[],
        createdAt: Date,
        updatedAt: Date
      }
    ]
  }
  ```

### Infrastructure

- **Hosting**: Vercel (optimized for Next.js)
- **Deployment**: Vercel CI/CD pipeline

## Data Flow

1. User input → React component state management
2. Encoding/decoding → Web3 library (viem)
3. Data storage → IndexedDB API
4. UI rendering → React component updates

## Core Page Composition

### 1. Homepage

- Service introduction and key feature description
- Direct buttons to decoder/encoder
- Recent usage history (if available)

### 2. Calldata Decoder Page

- Calldata input field
- ABI input field (optional)
- Network selection dropdown (default, testnets, custom RPC)
- Decoded result display section
  - Function signature
  - Parameter names, types, values
- Save result button

### 3. Calldata Encoder Page

- Function name input field
- Parameter type and value input fields (dynamically addable)
- Network selection dropdown (default, testnets, custom RPC)
- Encoding result display section
  - Generated Calldata
  - 4-byte signature explanation
- Save result button

### 4. Saved Items Page

- List of saved Calldata and ABIs
- Search and filtering functionality
- Edit and delete functionality

## Security Considerations

- All data processing performed client-side to minimize user data leakage risk
- Follow security best practices when connecting user wallets
- Thorough input validation on the frontend

## Implementation Roadmap

### Phase 1: MVP Development (1-2 weeks)

- Basic project structure setup
- Calldata decoder implementation
- Calldata encoder implementation
- Basic UI layout and design

### Phase 2: Improvements and Additional Features (2-3 weeks)

- Local storage functionality implementation
- Network selection and custom RPC functionality
- UI/UX improvements
- Testing and bug fixes

### Phase 3: Extended Features (Post-MVP)

- Wallet connection and transaction testing functionality
- ABI management functionality
- Additional Ethereum developer tools

## Expansion Possibilities

- Event decoder/encoder
- Smart contract verification tools
- Gas cost calculator
- Ethereum unit converter
- Transaction simulator

## Technical Implementation Directions

### 4bytes API Integration

- **Purpose**: Decode function signatures from Calldata even without ABIs
- **Implementation Approach**:
  - Extract the first 4 bytes (function signature) from Calldata and query the 4bytes API
  - Display list of possible function signatures from results
  - Provide options to users when multiple signatures exist
  - Optimize performance through response caching

### Calldata Encoding/Decoding Using Viem

- **Decoding Strategy**:

  - With ABI: Use viem's parseAbi and decodeAbiParameters
  - Without ABI: Use 4bytes API for function signature decoding
  - Display values according to parameter types (address, uint, bytes, etc.)
  - Show hex data alongside decoded information

- **Encoding Strategy**:
  - Provide UI for defining function signatures and parameter types
  - Dynamically generate input forms based on types
  - Utilize viem's encodeFunctionData
  - Visualize and explain the encoding process

### State Management (Jotai)

- **Atom Design**:

  - Atomic state for saved ABIs and Calldata management
  - Network settings (mainnet, testnet, custom RPC) management
  - Recent usage history storage mechanism

- **State Persistence**:
  - Integration with IndexedDB for local storage
  - Automatic saving logic on state changes

### IndexedDB Integration

- **Data Schema**:

  - Saved items (ABI, Calldata) model definition
  - Indexing by type and creation date

- **Key Features**:
  - CRUD operations for items
  - Filtering and searching by type
  - Handling concurrency issues

## Code Quality and Maintainability Guidelines

### Modularization and Component Design Principles

- **Single Responsibility Principle**:

  - Design each component with only one responsibility
  - Create clearly separated modules by functionality
  - Break complex logic into multiple smaller functions

- **File Size Management**:

  - Split files to avoid exceeding 200-300 lines per file
  - Break overly large components into smaller sub-components
  - Group related functionality in the same directory but separate files

- **Maximize Reusability**:

  - Abstract UI elements into reusable common components
  - Separate business logic into hooks and utility functions
  - Separate presentation and logic layers in components

- **Clear Interface Definitions**:
  - Explicitly define props and return types for components
  - Clearly distinguish between public APIs and internal implementations
  - Extensively use TypeScript interfaces and types

### Code Consistency Maintenance

- **Coding Conventions**:

  - Apply consistent naming rules (camelCase, PascalCase, etc.)
  - Prefer functional components and hook patterns
  - Use clear comments and documentation

- **State Management Consistency**:

  - Follow jotai's atomic state management principles
  - Clearly distinguish between local and global state
  - Apply consistent patterns for state updates

- **Error Handling Standardization**:
  - Consistent error handling and logging mechanisms
  - User-friendly error messages
  - Explicit handling of exceptional situations

### Testing and Quality Assurance

- **Testable Design**:

  - Design in pure functions and small component units
  - Utilize dependency injection patterns
  - Minimize and isolate side effects

- **Performance Optimization**:
  - Prevent unnecessary re-rendering
  - Appropriately use memoization (useMemo, useCallback)
  - Efficiently handle asynchronous logic
