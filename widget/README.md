# SeQura Widget - Technical Assessment Solution

## How to Set Up and Run

### Development Mode

```bash
npm install
npm run dev  # Opens development playground at http://localhost:5173
```

### Local Integration Testing

```bash
npm install
npm run build  # Generates ./dist/sequra-widget.umd.js
```

Add to your HTML:

```html
<script src="./dist/sequra-widget.umd.js"></script>
<script>
  if (typeof SequraWidget !== "undefined") {
    SequraWidget.init("#sequra-widget", {
      priceSelector: ".price",
      quantitySelector: ".qty",
    });
  }
</script>
```

### Production Release

```bash
npm run release  # Creates git tag and enables CDN distribution
```

## Technical Approach and Reasoning

### Architecture Decisions

**Vite + React + TypeScript + TailWindCSS**: Chose this stack for rapid development with modern tooling. Vite provides fast builds and hot reloading, while TypeScript ensures type safety for a widget that will integrate with unknown consumer environments.

**UMD Bundle Strategy**: Selected UMD over ESM to maximize compatibility with existing merchant sites. Many e-commerce platforms still use older module systems, and UMD ensures the widget works regardless of the consumer's build setup.

**CDN Distribution via JSDelivr**: Implemented automatic CDN distribution using GitHub releases. This provides merchants with a reliable, versioned URL without requiring them to host files. JSDelivr was chosen as a free, reliable CDN that automatically serves the latest releases.

### Integration Philosophy

**Zero-Impact Integration**: The primary goal was ensuring the widget never breaks merchant sites. This drove several key decisions:

- **Graceful Error Handling**: All errors are caught and logged to console with clear messages for developers, while showing appropriate UI fallbacks to users
- **Defensive Selector Logic**: The widget validates all DOM selectors before use and provides meaningful error messages when elements aren't found
- **Namespace Protection**: Used `SequraWidget` global namespace to avoid conflicts

**Minimal Configuration**: Required only three parameters (container, price selector, quantity selector) to reduce integration complexity. Selectors can target any element type (input, span, div, etc.) for maximum flexibility.

### Component Architecture

**Modular Structure**: Organized components into business logic (`components/`) and reusable UI (`components/ui/`) to enable future design system extraction.

**Accessibility First**: Implemented proper ARIA attributes and keyboard navigation in the dropdown component, ensuring the widget meets accessibility standards.

**Responsive Design**: Built mobile-first with adaptive modal positioning. On small screens (<480px), modals appear at the top with scroll functionality for landscape orientation.

### Event Tracking Strategy

**Comprehensive Analytics**: Implemented event tracking for the complete user journey:

- Widget initialization and loading states
- Installment selection with context data
- Modal interactions
- Error events with detailed debugging information

**Flexible Event Structure**: Events include fixed fields plus a `context` object for future extensibility without breaking changes.

### Error Resilience

**Defensive Programming**: Every external dependency (DOM queries, API calls) is wrapped in try-catch blocks with appropriate fallbacks:

- API failures show user-friendly messages while logging technical details
- Missing DOM elements trigger console warnings without breaking functionality
- Network issues are handled gracefully with retry mechanisms

## Tradeoffs and Assumptions

### Assumptions Made

1. **Merchant DOM Structure**: Assumed merchants have accessible price and quantity elements with consistent selectors
2. **Modern Browser Support**: Targeted ES2015+ browsers (covers 95%+ of users)
3. **Single Currency**: Assumed single-currency implementation (EUR) for this assessment
4. **API Reliability**: Built with the assumption that the SeQura API has reasonable uptime and response times

### Tradeoffs Accepted

**Bundle Size vs Features**: Included React for component architecture despite bundle size impact. The development speed and maintainability benefits outweighed the ~40KB overhead for this use case.

**CSS-in-JS vs External Styles**: Used Tailwind CSS for rapid styling but acknowledged potential style conflicts (addressed in improvements section).

**Client-Side Rendering**: Chose CSR over SSR for simplicity, accepting the initial render delay for better integration flexibility.

## Future Improvements (Time Constraints)

### Internationalization (i18n)

**Current State**: All text is hardcoded in Spanish.

**Planned Implementation**:

- Add `react-i18next` for translation management
- Implement language detection via browser locale or merchant configuration
- Create translation files for supported markets (ES, EN, FR, IT, etc.)
- Add `locale` parameter to widget initialization

```javascript
SequraWidget.init("#sequra-widget", {
  priceSelector: ".price",
  quantitySelector: ".qty",
  locale: "en", // Auto-detect if not provided
});
```

### Style Isolation

**Current Issue**: Tailwind classes could conflict with merchant styles.

**Solution Options Evaluated**:

1. **CSS Prefix Approach** (Recommended):

   - Configure Tailwind with custom prefix: `sq-`
   - Pros: Simple implementation, small bundle impact
   - Cons: Requires build configuration changes

2. **Shadow DOM Approach**:
   - Encapsulate widget in Shadow DOM
   - Pros: Complete style isolation
   - Cons: Complexity with event handling, accessibility concerns, limited browser support for some features

**Implementation Plan**: CSS prefix approach using PostCSS configuration:

```javascript
// tailwind.config.js
module.exports = {
  prefix: "sq-",
  // ... rest of config
};
```

### Additional Improvements

**Performance Optimizations**:

- Implement lazy loading for the "More Info" modal
- Add API response caching: but this point have to be discussed due to the volatile the instalments can be during time.
- Optimize bundle splitting for faster initial loads

**Enhanced Error Handling**:

- Add retry mechanisms with exponential backoff
- Implement offline detection and graceful degradation
- Add health check endpoints for proactive monitoring

**Testing Coverage**:

- Add visual regression tests
- Implement cross-browser automated testing
- Add performance benchmarking

## Project Structure

```
src/
├── api/              # API integration and event tracking
├── components/       # Business logic components
│   └── ui/          # Reusable UI components (future design system)
├── __tests__/       # Test suites
└── __mocks__/       # Test data and mocks
```

The architecture supports future scaling while maintaining the core principle of zero-impact merchant integration.

## Use of AI Tools

I used AI tools selectively throughout this project to streamline repetitive or time-consuming tasks, while maintaining full ownership of the design, architecture, and implementation decisions. Specifically, I leveraged AI for:

- Generating templates/scaffolding as a way to have a base to start-width and not to write everything from scratch:
  - Examples:
    - **Based on this `data` obtained from this `API` call, map it and generate this JSX structure I will use in "this" component.**
    - **Cleanup the project for every `console.logs` I added to debug `X` usecase**
    - **Generate a `.html` template to test this part of the app as a playground.**
    - **Create a `constants.ts` file that holds all the `event` Ids I used + refactor the occurrencies to use them from this file instead.**
- Generating Tailwind CSS class names more efficiently (e.g. applying multiple styles in one command instead of writing them manually).
- Extracting small pieces of logic into helper functions and generating their corresponding unit tests.
- Simplifying project configuration steps (e.g. fine-tuning vite.config.js and other setup files).
- Minor writing assistance for grammar correction and improving the clarity and structure of this documentation.
  AI was not used to make architectural decisions, implement core features, or solve problems I didn’t understand (For this in particular I prefer official documentation, in which I can use the AI to summarise content and speed-up search for a particular case).
  It served mainly as a productivity aid/tool, helping me speed up routine tasks and focus on the parts of the challenge that required deeper reasoning and technical design.

## Distribution Strategy for Merchants

To distribute this widget to all SeQura merchants, I would implement a multi-channel approach: (1) **Developer Portal Integration** - Create comprehensive documentation and integration guides in SeQura's developer portal with live examples and testing tools, (2) **Merchant Dashboard** - Add a "Widget Integration" section to the existing merchant dashboard where merchants can generate their custom integration code with their specific selectors, (3) **Technical Support** - Provide dedicated integration support through SeQura's existing merchant success team, and (4) **Gradual Rollout** - Start with a pilot program with key merchants, gather feedback, then expand to all merchants with A/B testing to measure conversion impact. The CDN-based distribution ensures zero maintenance overhead for merchants while providing SeQura with centralized version control and instant updates across all implementations.
