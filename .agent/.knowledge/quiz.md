Quiz Funnel Design - Source of Truth

This is a knowledge guide for @src/tools/quizfunnel.tsx

Marketing Objectives
Primary Goal: Lead Generation & Segmentation
This quiz is a psychological funnel designed to:

Capture high-intent leads via email gate before revealing results
Segment prospects by business type, location, timeline, and learning preference
Build trust by providing personalized, accurate revenue calculations
Drive conversions to the pricing page with tailored positioning
Value Ladder Connection
Per the content constraints:

Free Tool (Calculator/Quiz) = Lead magnet that reveals the opportunity
Paid Offers = Execute what the calculator reveals
The quiz frames the opportunity without solving the problem directly
Psychological Question Progression
Questions 1-3: Easy Entry (Warm-Up)
Purpose: Build momentum with non-threatening questions that feel conversational

Vision - "What does your dream childcare business look like?"

Opens conversation about aspirations
No technical knowledge required
Emotionally engaging
Situation - "Where are you in your journey?"

Helps user self-identify their stage
Segmentation data for marketing
Low barrier to answer
Challenge - "What's your biggest hurdle?"

Identifies pain points for segmentation
Shows we understand their struggles
Sets up our solution positioning
Questions 4-6: Essential Calculator Inputs (Data Collection)
Purpose: Gather state-specific data needed for accurate calculations

State - "Where will your business be?"

CRITICAL: Unlocks state-specific market rates
Determines license type branching logic
Shows "we have your local data" → builds credibility
Success Vision - "When this works, what changes?"

Deepens emotional investment
Segmentation for messaging
Keeps psychological momentum before fork
Business Type - "Which path are you taking?" 🔀

THE FORK POINT
Determines entire calculation path
Must come after state selection
Questions 7-8 (Variable): Technical Specs Based on Path
Purpose: Calculate accurate revenue based on business model

HOME PATH (States WITH large license option):
License Type - "How big do you want to go?"

Only shown if state.hasLargeLicense === true
Determines capacity limits
Frames growth potential
Total Children - Slider

Auto-distributes into age groups for max revenue
Interactive = engaging
Max depends on license choice
HOME PATH (States WITHOUT large license):
Total Children - Slider (SKIP LICENSE QUESTION)
Jumps straight to capacity
Max set to state.smallCap
7 states only: GA, HI, LA, MS, NJ, OH, DC
CENTER PATH:
Total Capacity - Slider
20-150 kids (capped by state max)
Auto-distributes into 4 age groups
Step size = 5 for faster selection
Questions 9-10: Marketing Segmentation + Momentum
Purpose: Final segmentation data while maintaining engagement

Learning Style - "How do you prefer support?"

Maps to product tiers (DIY → DFY)
Positions our offerings
Easy to answer
Timeline - "When do you want to launch?"

Urgency indicator for sales
Follow-up cadence segmentation
Ends on action-oriented note
Email Gate Strategy
Why Email Before Results
Perceived Value: Blur creates curiosity gap
Commitment: User has invested time answering 10 questions
Social Proof: "Join 10,000+ childcare owners"
Low Friction: Single field, clear benefit
Email Gate UI Elements
🎉 Celebration emoji - "Your Revenue Report is Ready!"
Blurred revenue preview - Shows the numbers exist
🔒 "Enter email to unlock" - Clear value exchange
"Where should we send your breakdown?" - Benefit framing
Trust badge: "No spam" disclaimer
Results Screen Strategy
Revenue Reveal
Shows state-specific range: $X - $Y/year
Range strategy: Accounts for market vs. subsidized rates
Mentions "local [State] market data" → credibility
✨ "This is absolutely achievable with the right plan" → belief
Call to Action
🚀 "See How to Get Started" → Pricing page
Mentions email was sent → keeps engagement warm
Urgency implied by "Get Started" language
Technical Flow Paths
⚠️ Failed to render Mermaid diagram: Lexical error on line 28. Unrecognized text.
...--> Pricing[/pricing]
-----------------------^
graph TD
    Start[Q1-5: Marketing + State] --> Q6[Q6: Business Type]
    
    Q6 -->|Home| CheckLicense{State has<br/>Large License?}
    Q6 -->|Center| CenterSlider[Q7: Capacity Slider<br/>Step 6]
    
    CheckLicense -->|Yes<br/>47 states| LicenseQ[Q7: License Type<br/>Step 6]
    CheckLicense -->|No<br/>7 states| HomeSliderSmall[Q7: Capacity Slider<br/>Step 6<br/>Small Only]
    
    LicenseQ --> HomeSliderLarge[Q8: Capacity Slider<br/>Step 7<br/>Based on License]
    
    HomeSliderSmall --> Q9Small[Q9: Learning Style<br/>Step 7]
    HomeSliderLarge --> Q9Large[Q9: Learning Style<br/>Step 8]
    CenterSlider --> Q9Center[Q9: Learning Style<br/>Step 7]
    
    Q9Small --> Q10Small[Q10: Timeline<br/>Step 8]
    Q9Large --> Q10Large[Q10: Timeline<br/>Step 9]
    Q9Center --> Q10Center[Q10: Timeline<br/>Step 8]
    
    Q10Small --> EmailSmall[Email Gate<br/>Step 9]
    Q10Large --> EmailLarge[Email Gate<br/>Step 10]
    Q10Center --> EmailCenter[Email Gate<br/>Step 9]
    
    EmailSmall --> Results
    EmailLarge --> Results
    EmailCenter --> Results
    
    Results[Results Screen] --> Pricing[/pricing]
State-Specific Logic
States WITHOUT Large License (7 total)
Georgia (GA)
Hawaii (HI)
Louisiana (LA)
Mississippi (MS)
New Jersey (NJ)
Ohio (OH)
Washington D.C. (DC)
Behavior: Skip license type question, go straight to capacity slider with smallCap limit

All Other States (47)
Behavior: Show license type question, then capacity slider with dynamic max

Calculation Accuracy
Why Sliders Match Original Calculator
User Familiarity: Existing users expect slider controls
Auto-Distribution: Maximizes revenue by prioritizing infants (highest rates)
State-Specific Caps: Respects licensing regulations
No Manual Age Entry: Reduces friction, increases completion
Home Calculation Logic
// Auto-distribute to maximize revenue
infantsFirst = min(totalKids, maxInfantsForLicense)
remaining = totalKids - infantsFirst
toddlers = min(remaining, ceil(remaining * 0.6))
preschool = remaining - toddlers
Center Calculation Logic
// Auto-distribute across 4 age groups
infants = min(30, floor(capacity * 0.2))
toddlers = floor(remaining * 0.35)
preschool = floor(remaining2 * 0.65)
schoolAge = remainder
Design Rationale Summary
Decision	Marketing Reason	Technical Reason
10 questions total	Completion psychology (progress bar)	Enough data for segmentation
Easy questions first	Build momentum	Lower abandonment
State before business type	Need data for branching	State determines license options
Sliders for capacity	Engaging, familiar	Prevents invalid inputs
Email gate at end	Maximum investment	High conversion point
Blurred preview	Curiosity gap	Increases form completion
Range (not exact)	Perceived accuracy	Accounts for variables
Direct to /pricing	Clear next step	Higher purchase intent
Success Metrics to Track
Completion rate by step (identify drop-off points)
Email capture rate (gate conversion)
Pricing page click-through (CTA effectiveness)
Segmentation data quality (can we personalize follow-up?)
Lead quality by timeline segment (sales prioritization)