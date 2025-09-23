# Contributing to SpaceChild

Thank you for your interest in contributing to SpaceChild! We welcome contributions from the community to help improve the platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
5. Set up the database:
   ```bash
   pnpm db:push
   ```
6. Start the development server:
   ```bash
   pnpm dev
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-short-description
   ```
2. Make your changes
3. Run tests:
   ```bash
   pnpm test
   ```
4. Commit your changes with a descriptive message
5. Push to your fork and submit a pull request

## Code Style

- Use TypeScript with strict mode
- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

- Write tests for new features and bug fixes
- Update tests when changing functionality
- Run all tests before submitting a pull request
- Ensure all tests pass before merging

## Pull Requests

1. Keep pull requests focused on a single feature or bugfix
2. Include a clear description of the changes
3. Reference any related issues
4. Update documentation as needed
5. Ensure all tests pass
6. Get at least one code review before merging

## Reporting Bugs

1. Search existing issues to avoid duplicates
2. Create a new issue with a clear title and description
3. Include steps to reproduce the issue
4. Add any relevant error messages or screenshots
5. Specify your environment (browser, OS, etc.)

## Feature Requests

1. Search existing feature requests to avoid duplicates
2. Create a new issue with a clear title and description
3. Explain why this feature would be valuable
4. Include any relevant use cases or examples

## Documentation

- Update documentation when adding or changing features
- Keep documentation clear and concise
- Use proper formatting and structure
- Add examples where helpful

## License

By contributing to SpaceChild, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.
