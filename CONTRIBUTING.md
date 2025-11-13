# Contributing to Cyber Jeopardy Madness

Thank you for your interest in contributing to Cyber Jeopardy Madness! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/device information

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:
- Clear description of the enhancement
- Why it would be useful
- Examples of how it would work
- Any implementation ideas

### Adding Questions

To add new cybersecurity questions:

1. Edit `game_questions.json`
2. Add questions to existing categories or create new ones
3. Follow this format:

```json
{
  "points": 100,
  "question": "Clear, concise question text?",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "answer": "Correct Option",
  "explanation": "Educational explanation of why this is correct"
}
```

**Question Guidelines:**
- Keep questions relevant to Federal Credit Union cybersecurity
- Ensure one clearly correct answer
- Make options plausible but distinguishable
- Provide educational explanations
- Cite sources for compliance-related questions
- Test questions before submitting

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Comment complex logic
   - Test thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "Add feature: description"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Code Style

**JavaScript:**
- Use modern ES6+ syntax
- Descriptive variable names
- Comment complex logic
- Keep functions focused and small
- Handle errors gracefully

**CSS:**
- Use CSS variables for colors
- Follow existing naming conventions
- Ensure responsive design
- Test on multiple browsers

**HTML:**
- Semantic HTML5 elements
- Accessible markup (ARIA labels where needed)
- Clean indentation

### Testing

Before submitting:
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile devices
- Verify all game features work
- Check for console errors
- Validate JSON syntax
- Test with and without AI enabled

### Pull Request Process

1. Update README.md if needed
2. Add yourself to contributors section
3. Ensure all tests pass
4. Provide clear PR description
5. Link any related issues
6. Wait for review and address feedback

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Prioritize educational value
- Maintain professional tone

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Spam or self-promotion
- Publishing others' private information

## Question Content Guidelines

Since this is educational cybersecurity content:

- Ensure accuracy of security information
- Use current best practices (not outdated)
- Cite authoritative sources when possible
- Avoid vendor-specific solutions
- Focus on principles over specific tools
- Keep credit union context in mind

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

## Questions?

Open an issue labeled "question" or reach out to maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make cybersecurity training more engaging and effective!**
