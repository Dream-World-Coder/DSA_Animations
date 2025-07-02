# DSA Animations 🎯

An interactive web platform for visualizing Data Structures and Algorithms through beautiful animations. Built with React and modern web technologies to make learning DSA concepts intuitive and engaging.

![DSA Animations Banner](https://dsa-experiments.vercel.app/favicon.svg)

## ✨ Features

- **Interactive Visualizations**: Step-by-step animations for popular algorithms
- **Comprehensive Coverage**: 7+ algorithm categories with 25+ implementations
- **Modern UI**: Clean, dark-themed interface with smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Fast Performance**: Built with Vite for lightning-fast development and builds
- **Accessible**: Keyboard navigation and screen reader friendly

## 🎮 Demo

🌐 **Live Demo**: [DSA Animations](https://dsa-experiments.vercel.app)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/dream-world-coder/DSA_Animations.git

# Navigate to project directory
cd DSA_Animations

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 📚 Available Algorithms

### 🔗 Array & LinkedList

- Kadane's Algorithm

### 🔄 Recursion

- Tower of Hanoi
- Josephus Problem
- Binary Search
- Quick Sort

### 📚 Stack & Queue

- Expression Evaluation
- Round Robin Algorithm

### 🌳 Tree

- Red-Black Tree

### 🕸️ Graph

- Graph Representation
- DFS & BFS
- Dijkstra's Algorithm
- Floyd-Warshall
- Minimum Spanning Tree

### ⚡ Greedy

- Activity Selection
- Fractional Knapsack
- Huffman Coding
- Job Scheduling
- Coin Change

### 🔙 Backtracking

- N-Queens Problem
- Sudoku Solver
- Knight's Tour
- Maze Solving
- Subset Generation

## 🛠️ Built With

- **Frontend Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📁 Project Structure

```
DSA_Animations/
.
├── components.json
├── eslint.config.js
├── index.html
├── LICENSE
├── package.json
├── public
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── README.md
├── src
│   ├── App.css
│   ├── App.jsx
│   ├── assets
│   │   └── data
│   │       └── navLinks.js
│   ├── components
│   │   ├── Footer
│   │   │   └── Footer.jsx
│   │   ├── Header
│   │   │   ├── Header.jsx
│   │   │   └── ShadCNNav.jsx
│   │   ├── Logo.jsx
│   │   ├── SearchBar.jsx
│   │   ├── SEO.jsx
│   │   └── ui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── navigation-menu.tsx
│   ├── index.css
│   ├── lib
│   │   └── utils.ts
│   ├── main.jsx
│   └── pages
│       ├── array
│       │   └── Kadane.jsx
│       ├── home
│       │   └── Home.jsx
│       └── recursion
│           ├── Josephous.jsx
│           ├── QuickSort.jsx
│           └── TowerOfHanoi.jsx
├── tsconfig.app.json
├── tsconfig.json
├── vercel.json
└── vite.config.js
```

## 🎨 Design System

### Color Palette

- **Background**: `neutral-900` (#171717)
- **Cards**: `neutral-800` (#262626)
- **Borders**: `neutral-700` (#404040)
- **Accent**: `green-500` (#22c55e)
- **Text**: `white` / `neutral-300`

### Typography

- **Headings**: Inter, system fonts
- **Body**: Clean, readable font stack
- **Code**: Monospace font family

## 🔧 Development Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📖 Usage

1. **Browse Categories**: Navigate through different algorithm categories on the homepage
2. **Select Algorithm**: Click on any algorithm card to view its visualization
3. **Interactive Controls**: Use play, pause, and step controls to navigate through animations
4. **Adjust Speed**: Control animation speed with the speed slider
5. **Learn**: Read algorithm explanations and complexity analysis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Add proper documentation for new algorithms
- Include unit tests for new features
- Update README.md if needed
- Ensure responsive design for new components

## 🐛 Bug Reports

If you discover any bugs, please create an issue [here](https://github.com/yourusername/DSA_Animations/issues) with:

- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser/device information

## 💡 Feature Requests

Have an idea for a new algorithm or feature? Open an issue with the `enhancement` label and describe:

- Feature description
- Use case/motivation
- Possible implementation approach

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspiration from various algorithm visualization platforms
- [React](https://reactjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- Open source community for continuous inspiration

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/dream-world-coder/DSA_Animations?style=social)
![GitHub forks](https://img.shields.io/github/forks/dream-world-coder/DSA_Animations?style=social)
![GitHub issues](https://img.shields.io/github/issues/dream-world-coder/DSA_Animations)
![GitHub license](https://img.shields.io/github/license/dream-world-coder/DSA_Animations)

## 🔗 Links

- **Repository**: [GitHub](https://github.com/dream-world-coder/DSA_Animations)
- **Live Demo**: [Demo Site](https://dsa-experiments.vercel.app)
- **Documentation**: [Wiki](https://github.com/dream-world-coder/DSA_Animations/wiki)
- **Issues**: [Issue Tracker](https://github.com/dream-world-coder/DSA_Animations/issues)

---

<div align="center">
  <p>Made with ❤️ for the coding community</p>
  <p>
    <a href="https://github.com/dream-world-coder">GitHub</a> •
    <a href="https://linkedin.com/in/subhajitgorai">LinkedIn</a> •
    <a href="mailto:blog.opencanvas@gmail.com">Email</a>
  </p>
</div>
