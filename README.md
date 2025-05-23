# Ethereum Developer Toolkit

A modern web-based platform providing essential utility tools for Ethereum developers, with a focus on smart contract development and debugging.

## 🚀 Features

### Calldata Decoder
- Decode Ethereum transaction calldata hex strings into human-readable format
- Support for decoding with or without ABI
- Function signature resolution via 4bytes.directory API
- Real-time parameter display with type information
- Decoding history tracking
- Color-coded calldata visualization

### Calldata Encoder
- Generate valid calldata from smart contract functions and parameters
- Dynamic form generation based on ABI function types
- Real-time parameter validation
- Support for complex types (arrays, tuples, bytes)
- Automatic type conversion and formatting

### Data Storage
- Save frequently used ABIs for quick access
- Store decoding history for reference
- Manage saved function signatures
- All data stored locally using IndexedDB

## 🛠️ Technology Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Jotai](https://jotai.org/) (atomic state management)
- **Web3 Library**: [viem](https://viem.sh/) (lightweight Ethereum interface)
- **Local Storage**: IndexedDB (via [idb](https://github.com/jakearchibald/idb))
- **TypeScript**: Full type safety throughout the application

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/eth-toolkit-v2.git
cd eth-toolkit-v2
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📋 Available Scripts

```bash
# Development
pnpm dev          # Start development server

# Build & Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
```

## 📁 Project Structure

```
eth-toolkit-v2/
├── app/              # Next.js app router pages
│   ├── calldata/    # Calldata tools pages
│   │   ├── decoder/ # Decoder feature page
│   │   └── encoder/ # Encoder feature page
│   └── layout.tsx   # Root layout
├── components/       # Shared UI components
│   ├── layout/      # Layout components
│   ├── shared/      # Reusable components
│   └── ui/          # shadcn/ui components
├── features/         # Feature-specific code
│   ├── calldata-decoder/
│   │   ├── atoms/      # Jotai state atoms
│   │   ├── components/ # Feature components
│   │   ├── hooks/      # Custom hooks
│   │   └── lib/        # Utilities
│   └── calldata-encoder/
│       └── [similar structure]
├── lib/              # Shared utilities
│   ├── config/      # App configuration
│   ├── storage/     # IndexedDB implementation
│   ├── types/       # TypeScript types
│   └── utils/       # Utility functions
└── docs/            # Documentation
```

## 🔧 Architecture

The application follows a feature-based architecture with atomic state management:

1. **Atomic State Management**: Using Jotai for fine-grained reactive state
2. **Feature Isolation**: Each feature is self-contained with its own components, hooks, and state
3. **Type Safety**: Full TypeScript coverage with strict type checking
4. **Local-First**: All data stored locally in the browser using IndexedDB
5. **Responsive Design**: Mobile-first approach with full responsive support

## 🎯 Key Features in Detail

### Calldata Decoding Process
1. Input calldata hex string
2. Optionally provide ABI for precise decoding
3. If no ABI provided, fetch function signature from 4bytes.directory
4. Decode parameters using viem
5. Display results with type information and formatting
6. Save to history for future reference

### Calldata Encoding Process
1. Input or select saved ABI
2. Choose function from the ABI
3. Fill in parameters using dynamic form
4. Real-time validation and type checking
5. Generate encoded calldata
6. Copy to clipboard or save for later use

## 🤖 Development with AI

This project is being actively developed with the assistance of [Claude Code](https://claude.ai/code) and AI pair programming. The codebase follows best practices and maintains high quality standards through:

- Automated code formatting and linting
- Comprehensive TypeScript type checking
- Structured architecture patterns
- Thorough documentation

While AI assists in development, all code is reviewed and tested to ensure reliability and maintainability.

## 🤝 Contributing

Contributions are welcome! Please read the [CLAUDE.md](./CLAUDE.md) file for development guidelines and coding standards.

We encourage both traditional and AI-assisted contributions. If you're using AI tools like Claude Code, GitHub Copilot, or other AI programming assistants to help with your contributions, that's perfectly fine! Just ensure that:

- The code follows our project standards and guidelines
- You understand and can explain the code you're submitting
- All contributions pass our linting and type checking requirements

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [viem](https://viem.sh/) for excellent Ethereum utilities
- [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components
- [4bytes.directory](https://www.4byte.directory/) for function signature database
- The Ethereum community for continuous innovation

## 🔗 Links

- [Documentation](./docs/)
- [Live Demo](https://your-demo-url.vercel.app) (if deployed)
- [Report Issues](https://github.com/your-username/eth-toolkit-v2/issues)

---

Built with ❤️ for the Ethereum developer community