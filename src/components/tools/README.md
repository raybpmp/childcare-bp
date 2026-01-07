# Tool Development Guide

## Overview

This directory contains all interactive tools for the website. Each tool is self-contained and modular.

---

## Folder Structure

```
src/
├── pages/tools/              # Tool pages (one per tool)
│   └── [tool-name].astro
│
└── components/tools/         # Tool components
    └── [ToolName].tsx
```

---

## Creating a New Tool

### 1. Create the Component

Create `src/components/tools/YourToolName.tsx`:

```tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function YourToolName() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    // Your calculation logic
    setResult(parseFloat(input) * 2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Your Tool Name</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Inputs */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="input">Input Value</Label>
                <Input
                  id="input"
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <Button onClick={calculate}>Calculate</Button>
            </div>

            {/* Right: Results */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Results</h3>
              {result !== null && (
                <div className="text-3xl font-bold text-teal-600">
                  {result}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. Create the Page

Create `src/pages/tools/your-tool-name.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import YourToolName from '../../components/tools/YourToolName';
---

<Layout title="Your Tool Name | Childcare Business Plan">
  <main class="min-h-screen py-12 px-4">
    <YourToolName client:load />
  </main>
</Layout>
```

### 3. Test

```powershell
npm run dev
```

Navigate to `http://localhost:4321/tools/your-tool-name`

---

## Available Components

All shadcn components are available in `src/components/ui/`:

| Component | Use Case |
|-----------|----------|
| `Input` | Text, number, email inputs |
| `Label` | Form labels |
| `Button` | Actions, submissions |
| `Card` | Container for tool layout |
| `Select` | Dropdowns (state, category selection) |
| `Checkbox` | Multi-select options |
| `RadioGroup` | Single-select options |
| `Slider` | Range inputs (prices, quantities) |
| `Switch` | Toggle options |
| `Calendar` | Date picking |
| `Popover` | Tooltips, date pickers |
| `Form` | React Hook Form integration |

---

## Design Guidelines

### Layout Pattern

Use a **two-column layout**:
- **Left**: Inputs and controls
- **Right**: Results and outputs

### Styling

- Use existing glassmorphism classes: `glass-panel`, `glass-button`
- Match brand colors: `text-teal-600`, `bg-teal-600`
- Ensure mobile responsiveness with `md:grid-cols-2`

### Big Numbers

For impactful results:

```tsx
<div className="text-4xl font-bold text-teal-600 mb-2">
  ${monthlyIncome.toLocaleString()}
</div>
<p className="text-gray-600">Monthly Gross Income</p>
```

---

## Example: Income Builder

See `src/components/tools/IncomeBuilderTool.tsx` for a complete example with:
- State dropdown (Select)
- Age checkboxes (Checkbox)
- Price input (Input)
- Date picker (Calendar + Popover)
- Calculated outputs
- Responsive layout

---

## Tips

1. **Keep tools self-contained** — all logic in the component file or adjacent helper
2. **Use TypeScript** — define interfaces for inputs/outputs
3. **Add loading states** — for calculations or API calls
4. **Validate inputs** — use react-hook-form with zod if complex
5. **Make it embeddable** — tools should work on any page via `<YourTool client:load />`
