# Ella Rayne - Gemini OS

> Love me Love me Say that you love  
> fool me fool me I cant love anyone but

## 🚀 About

A React-based AI-powered operating system interface built with Firebase, TypeScript, and Tailwind CSS. Features include AI chat, file management, terminal simulation, and GitHub integration.

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🛠️ Setup

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **GitHub Actions** for CI/CD

### Linting & Formatting

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check if code is formatted
npm run format:check
```

## 🏗️ Project Structure

```
ella-rayne/
├── src/
│   ├── App.tsx           # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Application entry point
│   ├── index.css        # Global styles with Tailwind
│   └── assets/          # Static assets
├── .github/
│   └── workflows/       # CI/CD workflows
│       ├── ci.yml              # Main CI/CD pipeline
│       ├── dependency-review.yml  # Dependency security check
│       └── deploy.yml          # GitHub Pages deployment
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc.json     # Prettier configuration
└── package.json         # Project dependencies
```

## 🔒 Security

- **CodeQL** security scanning enabled in CI/CD
- **Dependency Review** on pull requests
- **npm audit** runs on every build
- Regular security updates via Dependabot (recommended to enable)

## 🚀 CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

### Main CI/CD Pipeline (`ci.yml`)
- ✅ Code linting with ESLint
- ✅ Code formatting check with Prettier
- ✅ TypeScript type checking
- ✅ Production build
- ✅ Security scanning with CodeQL
- ✅ npm audit for vulnerabilities

### Dependency Review (`dependency-review.yml`)
- 🔍 Automatic dependency vulnerability scanning on PRs
- ⚠️ Alerts for security issues in dependencies

### Deployment (`deploy.yml`)
- 🌐 Automatic deployment to GitHub Pages on main branch push

## 🔐 Environment Variables

This project uses Firebase. Set up your Firebase config:

1. Create a `.env` file (gitignored)
2. Add your Firebase configuration
3. Or use Canvas environment variables

## 📦 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase** - Backend services
- **Lucide React** - Icon library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality Standards

- All code must pass ESLint checks
- Code must be formatted with Prettier
- TypeScript strict mode must pass
- All CI/CD checks must pass

## 📄 License

This project is private.

## 🎵 Inspiration

> Love me Love me Say that you love  
> fool me fool me I cant love anyone but

---

**Made with ❤️ using React, TypeScript, and Firebase**
