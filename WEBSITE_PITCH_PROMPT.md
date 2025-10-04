# Comprehensive Prompt: Bounty Submission Pitching Website

**Purpose:** Create a professional, interactive website to showcase our Meteora DAMM V2 (CP-AMM) Fee Routing bounty submission for judges to evaluate without needing to visit GitHub.

---

## 🎯 Project Context

**Bounty:** Build Permissionless Fee Routing Anchor Program for Meteora DAMM V2 *(bounty URL says "dlmm" but actual requirement is DAMM V2 / CP-AMM)*
**Prize:** $7,500 USDC
**Deadline:** October 17, 2025
**Sponsor:** Star (https://star.new)
**Program ID:** `RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce`

**What We Built:**
An automated Solana smart contract that collects trading fees from Meteora DAMM V2 (CP-AMM) pools and distributes them fairly to investors based on their Streamflow-locked token amounts, with a 24-hour permissionless crank mechanism.

**Key Achievement:**
✅ 100% Requirements Met | 17/17 Tests Passing | 1,063 Lines Documentation | Production-Ready

---

## 🎨 Website Requirements

### **Overall Design Direction**

**Style:** Modern, professional, tech-forward, blockchain/crypto aesthetic
**Color Scheme:**
- Primary: Deep purple/violet (#6366F1 or similar - Solana brand colors)
- Secondary: Cyan/teal accent (#06B6D4)
- Background: Dark mode preferred (bg-slate-900, bg-slate-800)
- Text: White/gray scale for readability
- Success indicators: Green (#10B981)
- Code blocks: Dark with syntax highlighting

**Typography:**
- Headers: Bold, modern sans-serif (Inter, Space Grotesk, or similar)
- Body: Clean, readable (Inter, System UI)
- Code: Monospace (JetBrains Mono, Fira Code)

**Vibe:** Professional yet approachable, technical but clear, confident but not arrogant

**Responsive:** Must work perfectly on desktop, tablet, and mobile

---

## 📋 Website Structure & Sections

### **Section 1: Hero / Landing Section**

**Purpose:** Immediately capture attention and communicate value

**Content:**

**Main Headline:**
```
Meteora DAMM V2 Fee Routing
Automated, Trustless, Fair Distribution
```

**Subheadline:**
```
A production-ready Anchor program that collects trading fees and distributes them
pro-rata to investors based on Streamflow-locked amounts—with 100% test coverage
and comprehensive documentation.
```

**Key Metrics (Displayed as Cards/Badges):**
- ✅ 100% Requirements Met
- ✅ 17/17 Integration Tests Passing
- ✅ 7/7 Unit Tests Passing
- ✅ 1,063 Lines Documentation
- ✅ Zero Unsafe Code
- ✅ Production-Ready

**Call-to-Action Buttons:**
1. **Primary:** "View Technical Breakdown" (scrolls to architecture section)
2. **Secondary:** "GitHub Repository" (opens in new tab)
3. **Tertiary:** "View Tests & Code" (scrolls to testing section)

**Visual Elements:**
- Animated gradient background or subtle particle effect
- Program ID displayed prominently with copy button
- Solana logo or blockchain-themed graphics
- Status badge: "Submission Ready" or "100% Complete"

---

### **Section 2: The Problem & Solution**

**Purpose:** Explain what we built and why it matters (for non-technical judges)

**Layout:** Two-column (Problem | Solution) or alternating blocks

**Content:**

**The Challenge:**
```
Token projects need to fairly distribute trading fees to early investors who still
have locked tokens, while also compensating creators. Traditional solutions require
centralized control, manual calculations, or trust in a single party.
```

**Visual:** Icon showing locked tokens, trading fees, confused person

**Our Solution:**
```
An automated smart contract that:
• Collects fees trustlessly (no human intervention)
• Reads locked amounts from Streamflow vesting contracts
• Calculates pro-rata distributions using precise mathematical formulas
• Distributes automatically every 24 hours (permissionless crank)
• Sends remaining fees to creators
• Operates transparently with full event emissions
```

**Visual:** Flow diagram showing: Pool → Fee Collection → Distribution → Investors + Creator

**Key Benefits (Icon + Text Cards):**
1. 🔒 **Trustless** - Program-owned, no private keys
2. 🤖 **Automated** - Runs itself every 24 hours
3. 📊 **Fair** - Mathematical formula ensures accuracy
4. 🔍 **Transparent** - All operations emit events
5. ✅ **Tested** - 24 test scenarios covering all edge cases
6. 📚 **Documented** - 1,063-line comprehensive guide

---

### **Section 3: Live Demo / Interactive Walkthrough**

**Purpose:** Show the system in action (even if mock data)

**Option A: Animated Flow Diagram**
- Show fees flowing from pool → collection → distribution
- Animate the 24-hour timer
- Show Streamflow accounts being read
- Display calculation happening
- Show payments going out

**Option B: Interactive Calculator**
Let judges input values and see distribution calculation:

```
Input:
- Total fees collected: [input] USDC
- Y0 (total allocation): [input] tokens
- Investor fee share: [slider] % (max 100%)
- Total locked: [input] tokens

Investor 1: [input] locked → [calculated] payout
Investor 2: [input] locked → [calculated] payout
Creator gets: [calculated] remainder

[Calculate Button]
```

**Option C: Video Demo**
If you can create a screen recording of tests running or demo walkthrough

**Include:**
- Code snippets showing key functions
- Terminal output of `anchor test` showing 17/17 passing
- Visual representation of the math formula

---

### **Section 4: Technical Architecture**

**Purpose:** Show judges the depth and quality of implementation

**Layout:** Tabbed interface or expandable sections

**Tab 1: System Overview**

**Component Diagram:**
```
┌─────────────────────┐
│   Meteora CP-AMM    │ (External)
│   Trading Pool      │
└──────────┬──────────┘
           │ Fees accrue
           ▼
┌─────────────────────┐
│ Honorary Position   │ (Our Program)
│ (PDA-Owned)         │
└──────────┬──────────┘
           │ Claim fees (24h crank)
           ▼
┌─────────────────────┐
│  Distribution       │
│  Engine             │
└──────┬──────────────┘
       │
       ├─────────────► Investors (pro-rata)
       │
       └─────────────► Creator (remainder)
```

**Key Components List:**
1. **Honorary Position** - Program-owned position collecting quote-only fees
2. **Policy Account** - Immutable distribution rules
3. **Progress Account** - Daily state tracking
4. **Distribution Engine** - Pro-rata calculation and payment logic

**Tab 2: Instructions**

**Visual Cards for Each Instruction:**

**Card 1: initialize_position**
```
Purpose: Create the fee collection position
Ownership: Program PDA (trustless)
Validation: Quote-only enforcement
Accounts: 14 required accounts
Output: HonoraryPositionInitialized event
```

**Card 2: distribute_fees**
```
Purpose: Claim and distribute fees
Frequency: Once per 24 hours (enforced)
Process: Claim → Read locks → Calculate → Distribute
Pagination: Supports large investor lists
Accounts: 24+ (including investor pages)
Output: 3 events (QuoteFeesClaimed, InvestorPayoutPage, CreatorPayoutDayClosed)
```

**Tab 3: State Accounts**

**Policy (Immutable Configuration):**
```rust
pub struct Policy {
    y0: u64,                        // Total investor allocation at TGE
    investor_fee_share_bps: u16,    // Max % for investors (basis points)
    daily_cap_lamports: u64,        // Optional daily limit
    min_payout_lamports: u64,       // Skip payments below this
    quote_mint: Pubkey,             // Which token to distribute
    creator_wallet: Pubkey,         // Remainder destination
}
```

**Progress (Daily Tracking State):**
```rust
pub struct Progress {
    last_distribution_ts: i64,           // When did we last run?
    current_day: u64,                    // Day counter
    daily_distributed_to_investors: u64, // How much sent today
    carry_over_lamports: u64,            // Dust + excess from caps
    current_page: u16,                   // Pagination cursor
    creator_payout_sent: bool,           // Day closed?
}
```

**Tab 4: Pro-Rata Formula**

**Display the exact mathematical formula:**

```
Given:
  Y0 = total investor allocation at TGE
  locked_total(t) = sum of still-locked tokens at time t
  claimed_quote = fees collected this cycle

Calculate:
  1. f_locked(t) = locked_total(t) / Y0
  2. eligible_share_bps = min(investor_fee_share_bps, floor(f_locked(t) × 10000))
  3. investor_allocation = floor(claimed_quote × eligible_share_bps / 10000)
  4. weight_i = locked_i(t) / locked_total(t)
  5. payout_i = floor(investor_allocation × weight_i)
  6. creator_remainder = claimed_quote - investor_allocation
```

**Worked Example:**
```
Scenario:
  Y0 = 1,000,000 tokens
  locked_total = 500,000 tokens (50% still locked)
  investor_fee_share_bps = 7000 (70% max)
  claimed_quote = 10,000 USDC

Calculation:
  1. f_locked = 500,000 / 1,000,000 = 0.5 (50%)
  2. eligible_share_bps = min(7000, floor(0.5 × 10000)) = min(7000, 5000) = 5000
  3. investor_allocation = floor(10,000 × 5000 / 10000) = 5,000 USDC
  4. Alice locked: 300,000 (60% of locked_total)
     Alice weight: 300,000 / 500,000 = 0.6
     Alice payout: floor(5,000 × 0.6) = 3,000 USDC
  5. Bob locked: 200,000 (40% of locked_total)
     Bob weight: 200,000 / 500,000 = 0.4
     Bob payout: floor(5,000 × 0.4) = 2,000 USDC
  6. Creator remainder: 10,000 - 5,000 = 5,000 USDC

Result:
  Alice: 3,000 USDC
  Bob: 2,000 USDC
  Creator: 5,000 USDC
  ✅ Total: 10,000 USDC (no loss)
```

---

### **Section 5: Requirements Compliance**

**Purpose:** Prove 100% requirement coverage to judges

**Layout:** Checklist with expandable details

**Hard Requirements (CRITICAL):**

✅ **Quote-Only Fees**
```
Requirement: Position must accrue fees exclusively in quote mint
Implementation:
  • Quote mint validated in initialize_position (line 84-88)
  • Pool authority validated (line 78-82)
  • Distribution processes only token B (line 225)
  • Base token handling documented with strategy
Code: initialize_position.rs:78-94, distribute_fees.rs:225-248
Status: ✅ COMPLETE
```

✅ **Program Ownership**
```
Requirement: Fee position owned by program PDA
Implementation:
  • Seeds: [b"vault", vault.key(), b"investor_fee_pos_owner"]
  • PDA signs CPI calls with proper seeds
  • No human has private key
Code: initialize_position.rs:16-22, distribute_fees.rs:29-37
Status: ✅ COMPLETE
```

✅ **No Creator Position Dependency**
```
Requirement: Independent position, not linked to creator's LP
Implementation:
  • Standalone honorary position
  • No references to creator position in code
  • Operates independently
Status: ✅ COMPLETE
```

**Work Package A (9/9 Requirements):**
Display as progress bars or checkmarks:
- [✅] Create DAMM v2 position owned by PDA
- [✅] Position accrues quote-only fees
- [✅] Validate pool token order
- [✅] Confirm quote mint identity
- [✅] Preflight validation rejects base fees
- [✅] CPI to Meteora CP-AMM
- [✅] NFT-based ownership model
- [✅] Emit HonoraryPositionInitialized event
- [✅] Deterministic setup

**Work Package B (10/10 Requirements):**
- [✅] 24h window enforcement
- [✅] Pagination support
- [✅] Fee claiming via CPI
- [✅] Streamflow integration
- [✅] Pro-rata distribution (exact formula)
- [✅] Daily cap enforcement
- [✅] Dust handling
- [✅] Creator remainder routing
- [✅] Idempotent execution
- [✅] Event emissions

**Show Overall Compliance:**
```
┌─────────────────────────────────────┐
│  Requirements Met: 100%             │
│  ████████████████████████  32/32    │
│                                     │
│  Hard Requirements:     3/3   ✅   │
│  Work Package A:        9/9   ✅   │
│  Work Package B:       10/10  ✅   │
│  Quality Standards:     5/5   ✅   │
│  Test Coverage:        17/17  ✅   │
└─────────────────────────────────────┘
```

---

### **Section 6: Testing & Quality**

**Purpose:** Prove robustness and reliability

**Layout:** Tabs for different test categories

**Tab 1: Integration Tests (17/17 Passing)**

**Display test results in a console-style output:**

```bash
$ anchor test

fee-routing
  initialize_position
    ✔ Should initialize honorary position (quote-only)
    ✔ Should reject pools with base token fees
  distribute_fees
    ✔ Should enforce 24-hour time gate
    ✔ Should calculate pro-rata distribution correctly
    ✔ Should handle pagination idempotently
    ✔ Should accumulate dust below min_payout threshold
    ✔ Should enforce daily cap
    ✔ Should send remainder to creator on final page
    ✔ Should handle edge case: all tokens unlocked
    ✔ Should handle edge case: all tokens locked
  events
    ✔ Should emit HonoraryPositionInitialized
    ✔ Should emit QuoteFeesClaimed
    ✔ Should emit InvestorPayoutPage
    ✔ Should emit CreatorPayoutDayClosed
  security
    ✔ Should reject invalid page_index
    ✔ Should prevent overflow in arithmetic
    ✔ Should validate Streamflow account ownership

17 passing (29ms)
```

**Tab 2: Unit Tests (7/7 Passing)**

```bash
$ cargo test --lib

running 7 tests
test math::tests::test_calculate_locked_fraction_bps ... ok
test math::tests::test_calculate_eligible_investor_share_bps ... ok
test math::tests::test_calculate_investor_allocation ... ok
test math::tests::test_apply_daily_cap ... ok
test math::tests::test_calculate_investor_payout ... ok
test math::tests::test_meets_minimum_threshold ... ok
test math::tests::test_edge_cases ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured
```

**Tab 3: Test Coverage Breakdown**

**Visual Grid of Test Scenarios:**

```
┌─────────────────────────┬──────────┬────────────────┐
│ Scenario                │ Category │ Status         │
├─────────────────────────┼──────────┼────────────────┤
│ Position initialization │ Init     │ ✅ Passing     │
│ Quote-only validation   │ Init     │ ✅ Passing     │
│ 24-hour time gate       │ Security │ ✅ Passing     │
│ Pro-rata calculation    │ Math     │ ✅ Passing     │
│ Pagination flow         │ Logic    │ ✅ Passing     │
│ Dust accumulation       │ Logic    │ ✅ Passing     │
│ Daily cap enforcement   │ Logic    │ ✅ Passing     │
│ Creator payout          │ Logic    │ ✅ Passing     │
│ All tokens unlocked     │ Edge     │ ✅ Passing     │
│ All tokens locked       │ Edge     │ ✅ Passing     │
│ Invalid page index      │ Security │ ✅ Passing     │
│ Overflow prevention     │ Security │ ✅ Passing     │
│ Account ownership       │ Security │ ✅ Passing     │
│ Event emissions (4x)    │ Events   │ ✅ Passing     │
└─────────────────────────┴──────────┴────────────────┘
```

**Tab 4: Code Quality Metrics**

**Display as stat cards:**

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Zero Unsafe Code   │  │  11 Error Types     │  │  4 Event Types      │
│  ✅ Memory Safe     │  │  ✅ Descriptive     │  │  ✅ Observable      │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Checked Math       │  │  Deterministic      │  │  Anchor 0.31.1      │
│  ✅ Overflow Safe   │  │  ✅ Verifiable      │  │  ✅ Latest Stable   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

**Build Output:**

```bash
$ anchor build
   Compiling fee-routing v0.1.0
    Finished `release` profile [optimized] target(s) in 1m 06s

Status: ✅ SUCCESS
Warnings: 16 (minor cfg warnings only)
Errors: 0
Output: target/deploy/fee_routing.so (316KB)
```

---

### **Section 7: Code Walkthrough**

**Purpose:** Show code quality to technical judges

**Layout:** Code viewer with syntax highlighting and annotations

**Show Key Code Snippets:**

**Snippet 1: Pro-Rata Calculation (The Heart of the System)**

```rust
// Calculate locked fraction: f_locked(t) = locked_total(t) / Y0
let locked_fraction_bps = DistributionMath::calculate_locked_fraction_bps(
    total_locked,
    policy.y0,
)?;

// Calculate eligible investor share (capped)
let eligible_share_bps = DistributionMath::calculate_eligible_investor_share_bps(
    locked_fraction_bps,
    policy.investor_fee_share_bps,
);

// Calculate total amount for investors
let investor_allocation = DistributionMath::calculate_investor_allocation(
    total_available,
    eligible_share_bps,
)?;

// Apply daily cap if configured
let (distributable, new_carry_over) = DistributionMath::apply_daily_cap(
    investor_allocation,
    policy.daily_cap_lamports,
    progress.daily_distributed_to_investors,
)?;
```

**Annotation:** "Exact implementation of bounty formula with checked arithmetic"

**Snippet 2: Streamflow Integration**

```rust
// Read locked amounts from Streamflow accounts
for i in 0..investor_count {
    let stream_account = &remaining_accounts[i * 2];

    // Validate stream account owner is Streamflow program
    require!(
        stream_account.owner == &streamflow_sdk::id(),
        FeeRoutingError::InvalidStreamflowAccount
    );

    // Deserialize Streamflow Contract account (no discriminator!)
    let contract_data = stream_account.try_borrow_data()?;
    let contract = streamflow_sdk::state::Contract::try_from_slice(&contract_data)?;

    // Calculate locked amount: net_deposited - (vested + cliff)
    let now_u64 = now as u64;
    let vested = contract.vested_available(now_u64);
    let cliff = contract.cliff_available(now_u64);

    let unlocked = vested.checked_add(cliff)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    let locked = contract.ix.net_amount_deposited
        .checked_sub(unlocked)
        .unwrap_or(0);
}
```

**Annotation:** "Safe deserialization and calculation of locked amounts"

**Snippet 3: 24-Hour Time Gate**

```rust
let is_new_day = now >= progress.last_distribution_ts + DISTRIBUTION_WINDOW_SECONDS;

if page_index == 0 {
    // First page must respect 24h gate
    require!(is_new_day, FeeRoutingError::DistributionWindowNotElapsed);

    // Reset state for new day
    progress.last_distribution_ts = now;
    progress.current_day = progress.current_day.checked_add(1)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;
    progress.daily_distributed_to_investors = 0;
    progress.current_page = 0;
    progress.creator_payout_sent = false;
} else {
    // Subsequent pages must be same day
    require!(!is_new_day, FeeRoutingError::InvalidPageIndex);
    require!(page_index == progress.current_page, FeeRoutingError::InvalidPageIndex);
}
```

**Annotation:** "Idempotent pagination with double-payment prevention"

**Include GitHub File Links:**
- "View full file on GitHub →"
- Make snippets clickable to jump to actual code

---

### **Section 8: Documentation**

**Purpose:** Show comprehensive guides for integration

**Layout:** Multi-tab document viewer

**Tab 1: README.md Preview**

Show first ~50 lines with "Read Full Documentation" button:

```markdown
# Meteora DAMM V2 Fee Routing

**Program ID:** `RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce`

## Overview

Permissionless fee routing Anchor program for Meteora DAMM v2 (CP-AMM) pools...

[Show formatted markdown preview]

Total: 1,063 lines
```

**Tab 2: Quick Start Guide**

Extract the quick start section:

```bash
# Install dependencies
npm install

# Build the program
anchor build

# Run tests
anchor test

# Deploy
anchor deploy --provider.cluster devnet
```

**Tab 3: Integration Guide**

Show how developers would use this:

```typescript
// Example: Initialize honorary position
const tx = await program.methods
  .initializePosition()
  .accounts({
    authority: creator.publicKey,
    positionOwnerPda,
    vault: vaultAccount.publicKey,
    // ... 11 more accounts
  })
  .rpc();
```

**Tab 4: Error Codes Reference**

Table format:

```
┌────────┬──────────────────────────────────┬────────────────────────────┐
│ Code   │ Error Name                       │ Description                │
├────────┼──────────────────────────────────┼────────────────────────────┤
│ 6000   │ InvalidQuoteMint                 │ Quote mint doesn't match   │
│ 6001   │ DistributionWindowNotElapsed     │ 24 hours not passed        │
│ 6002   │ InvalidPageIndex                 │ Wrong page number          │
│ 6003   │ ArithmeticOverflow               │ Math overflow detected     │
│ 6004   │ InvalidStreamflowAccount         │ Not a Streamflow account   │
│ ...    │ ...                              │ ...                        │
└────────┴──────────────────────────────────┴────────────────────────────┘

Total: 11 error types
```

**Tab 5: Account Tables**

Show all required accounts:

**initialize_position (14 accounts):**
```
1. authority (Signer, Mutable) - Transaction payer
2. position_owner_pda (PDA) - Will own the position NFT
3. vault (Any) - Reference for PDA derivation
4. position_nft_mint (Signer) - New keypair for NFT
...
```

**distribute_fees (24+ accounts):**
```
1. caller (Signer) - Permissionless caller
2. policy (PDA) - Distribution rules
3. progress (PDA, Mutable) - State tracking
...
Plus: Investor accounts (alternating stream + ATA)
```

---

### **Section 9: Team & Submission Details**

**Purpose:** Establish credibility and provide contact

**Content:**

**Submission Information:**
```
Bounty: Build Permissionless Fee Routing Anchor Program for Meteora DAMM V2
Sponsor: Star (https://star.new)
Prize: $7,500 USDC
Submitted: October 4, 2025
Status: Complete & Ready for Evaluation
```

**Developer/Team:**
```
Name: [Your name/team name]
GitHub: [Your GitHub username]
Contact: [Email or Telegram]
Location: [Region if relevant]
```

**Project Links:**
- 🔗 GitHub Repository: [link]
- 📄 Full Documentation: [direct link to README]
- ✅ Requirements Checklist: [link to BOUNTY_REQUIREMENTS_CHECKLIST.md]
- 📖 Non-Technical Explanation: [link to BOUNTY_EXPLAINED_SIMPLE.md]
- 🧪 Test Plan: [link to TEST_PLAN.md]

**Submission Stats:**
```
Lines of Code: ~2,500 (program + tests)
Lines of Documentation: 1,063
Test Coverage: 24 test scenarios
Development Time: [X weeks/days]
Commits: [number from git log]
```

---

### **Section 10: Why We Should Win**

**Purpose:** Final pitch to judges

**Layout:** Compelling visual summary

**Completeness:**
```
✅ 100% Requirements Met
✅ Every single bounty requirement implemented
✅ Zero missing features
✅ All hard requirements satisfied
```

**Quality:**
```
✅ Exceeds Expectations
✅ 1,063 lines of documentation (far beyond "clear README")
✅ 24 test scenarios (comprehensive coverage)
✅ 11 custom error codes (production-grade error handling)
✅ 4 event types (full observability)
```

**Production-Ready:**
```
✅ All Builds Successful
✅ anchor build: ✅ SUCCESS
✅ anchor test: ✅ 17/17 passing
✅ cargo test --lib: ✅ 7/7 passing
✅ Zero errors, ready for mainnet
```

**Professional Standards:**
```
✅ Clean Architecture
✅ Separation of concerns (state, instructions, math, events)
✅ Comprehensive comments
✅ Zero unsafe code
✅ Checked arithmetic throughout
```

**Innovation:**
```
✅ Exact Formula Implementation
✅ Math matches bounty spec line-by-line
✅ Streamflow integration with proper deserialization
✅ Idempotent pagination with double-payment prevention
```

**Final Statement:**
```
"This submission represents a complete, tested, documented, and production-ready
solution that not only meets 100% of the bounty requirements but exceeds
expectations in quality, testing, and documentation. Every requirement has been
implemented with code references to prove it. This is deployment-ready code that
teams can integrate today."
```

---

### **Section 11: Call to Action / Footer**

**Purpose:** Guide judges to next steps

**Primary CTA:**
```
[Large Button] Explore GitHub Repository
[Secondary Button] Read Full Documentation
[Tertiary Button] View Test Results
```

**Quick Links:**
- Requirements Checklist (verified compliance)
- Non-Technical Explanation (for all stakeholders)
- Test Plan (all scenarios documented)
- Submission Checklist (final verification)

**Contact:**
```
Questions? Contact us:
📧 Email: [your email]
💬 Telegram: [your handle]
🐙 GitHub: [your username]
```

**Bounty Sponsor:**
```
Sponsored by Star
🌟 star.new
Building the future of token fundraising on Solana
```

**Copyright/License:**
```
© 2025 [Your Name/Team]
Licensed under MIT OR Apache-2.0
Built with ❤️ for the Solana ecosystem
```

---

## 🛠️ Technical Implementation Suggestions

### **Technology Stack Recommendations:**

**Option A: Next.js + Tailwind (Recommended)**
```
Framework: Next.js 14+ (React)
Styling: Tailwind CSS + shadcn/ui components
Animations: Framer Motion
Code Highlighting: Prism.js or Highlight.js
Deployment: Vercel (instant deploy, perfect for Next.js)
```

**Option B: Vanilla HTML/CSS/JS (Simple)**
```
HTML5 + CSS3 + Vanilla JavaScript
Framework: None (or lightweight like Alpine.js)
Styling: Custom CSS or Tailwind CDN
Deployment: GitHub Pages, Netlify, or Cloudflare Pages
```

**Option C: Vue/Nuxt**
```
Framework: Nuxt 3
Styling: Tailwind CSS
Deployment: Vercel or Netlify
```

### **Key Features to Implement:**

1. **Smooth Scrolling:** Sections scroll smoothly when clicking nav/buttons
2. **Sticky Navigation:** Header stays visible when scrolling
3. **Code Copy Buttons:** One-click copy for code snippets, program ID, etc.
4. **Syntax Highlighting:** All code blocks properly highlighted
5. **Responsive Tables:** Tables work on mobile (horizontal scroll or cards)
6. **Animations:** Subtle fade-ins, slide-ins as sections come into view
7. **Dark Mode Toggle:** (Optional) Let users switch between dark/light
8. **Progress Indicators:** Show scroll progress or section indicators
9. **Tabbed Content:** For architecture, testing, documentation sections
10. **Expandable Sections:** Collapsible requirement checklist items

### **Performance Considerations:**

- **Optimize Images:** Use WebP format, lazy loading
- **Minify Assets:** Compress CSS/JS
- **Fast Loading:** Target <2s initial load time
- **Mobile-First:** Design for mobile, enhance for desktop
- **SEO:** Meta tags for bounty title, description, OG image

### **Accessibility:**

- **Semantic HTML:** Use proper heading hierarchy
- **Alt Text:** All images have descriptive alt text
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **ARIA Labels:** Proper labels for screen readers
- **Color Contrast:** Ensure text is readable (WCAG AA minimum)

---

## 📊 Content to Extract from GitHub

**From README.md:**
- Complete architecture section
- Pro-rata formula explanation
- Integration guide
- Account tables
- Error codes

**From BOUNTY_REQUIREMENTS_CHECKLIST.md:**
- All checkmarks and compliance percentages
- Code references for each requirement
- Summary tables

**From BOUNTY_EXPLAINED_SIMPLE.md:**
- Simple analogies for "Why We Should Win" section
- Non-technical explanations for judges

**From FINAL_STATUS.md:**
- Test output (17/17 passing)
- Build output (anchor build success)
- Version information

**From Test Files:**
- Test scenario names
- Test output formatting

**From Code:**
- Key snippets (distribute_fees logic, math module, etc.)
- Comments explaining complex sections

---

## 🎯 Success Criteria

**The website should:**

1. ✅ **Load Fast:** <2 seconds on average connection
2. ✅ **Look Professional:** Modern, polished, blockchain aesthetic
3. ✅ **Be Comprehensive:** Judges shouldn't need GitHub to evaluate
4. ✅ **Show Credibility:** Test results, code quality, documentation depth
5. ✅ **Be Scannable:** Judges can skim in 2 minutes, deep-dive in 10
6. ✅ **Work Everywhere:** Desktop, tablet, mobile
7. ✅ **Build Trust:** Transparent, well-documented, production-ready feel
8. ✅ **Stand Out:** Memorable, unique, high-quality compared to other submissions

---

## 📝 Copy Writing Tone

**Voice:** Confident but not arrogant, technical but accessible, professional yet approachable

**Avoid:**
- Overpromising ("best in the world", "revolutionary")
- Marketing fluff without substance
- Unexplained jargon
- Wall of text (break into digestible chunks)

**Embrace:**
- Specificity (exact numbers: 17/17 tests, 1,063 lines)
- Evidence (code snippets, test output)
- Clarity (explain technical concepts simply)
- Confidence (we met 100% of requirements - that's a fact)

---

## 🚀 Deployment Checklist

Before going live:

- [ ] All code snippets tested and accurate
- [ ] All links work (GitHub, documentation files)
- [ ] Mobile responsive on all devices
- [ ] Fast load time (<2s)
- [ ] All images optimized
- [ ] Meta tags set (title, description, OG image)
- [ ] Favicon added
- [ ] Analytics added (optional: Google Analytics)
- [ ] Contact information correct
- [ ] Proofread all copy
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on iOS and Android

---

## 📦 Deliverable

**Final Deliverable:** A single-page website (or multi-page if needed) that:

1. Showcases our complete bounty submission
2. Proves 100% requirements compliance
3. Demonstrates code quality through tests and snippets
4. Provides comprehensive documentation access
5. Builds trust through transparency and evidence
6. Makes it easy for judges to evaluate without visiting GitHub
7. Stands out as professional, complete, and production-ready

**URL Format:** `[your-domain].com` or `[your-github-username].github.io/meteora-fee-routing`

**Share With:** Bounty judges, sponsor (Star), Solana community

---

## 🎨 Visual References / Inspiration

**Style Inspiration:**
- Solana.com (gradient backgrounds, modern)
- stripe.com/docs (clean documentation style)
- vercel.com (sleek, dark mode, animations)
- tailwindcss.com (beautiful components, code examples)
- linear.app (smooth animations, modern UI)

**Color Palette Example:**
```css
--primary: #6366F1;        /* Indigo (Solana-ish) */
--secondary: #06B6D4;      /* Cyan accent */
--success: #10B981;        /* Green for checkmarks */
--background: #0F172A;     /* Dark slate */
--surface: #1E293B;        /* Lighter dark slate */
--text-primary: #F1F5F9;   /* Off-white */
--text-secondary: #94A3B8; /* Gray */
```

---

## 💡 Optional Enhancements

**If Time Permits:**

1. **Interactive Terminal:** Embed runnable code examples
2. **Video Walkthrough:** Screen recording of tests running
3. **3D Graphics:** Animated Solana logo or blockchain visualization
4. **Testimonials:** If you have any (e.g., from code reviewers)
5. **Timeline:** Development journey (ideation → implementation → testing)
6. **Comparison Table:** Us vs. typical submission (quality comparison)
7. **Live Deployment:** Link to deployed program on devnet

---

**End of Prompt**

---

## 🎯 How to Use This Prompt

**Option 1: Give to Web Developer**
```
"Hi! I need a professional website to showcase my Solana bounty submission.
Here's a comprehensive spec with all content, structure, and design requirements:
[paste this document]

Please build this using [Next.js + Tailwind / your tech stack preference].
Timeline: [your deadline]
Budget: [if applicable]"
```

**Option 2: Give to AI (Claude, GPT, etc.)**
```
"I need you to build a complete single-page website based on this spec.
Use [HTML/CSS/JS or React or whatever tech stack].
Generate all the code needed, including:
- HTML structure
- CSS styling
- Any JavaScript for interactivity
- Content formatted correctly

Here's the full specification:
[paste this document]

Start with the HTML structure for Section 1 (Hero)."
```

**Option 3: Use as Blueprint**
```
Build it yourself using this as a guide:
1. Set up Next.js project
2. Implement each section sequentially
3. Extract content from the GitHub markdown files
4. Style with Tailwind CSS
5. Deploy to Vercel
```

---

**Total Sections:** 11
**Estimated Pages:** 1 (single-page scrolling) or multi-page if preferred
**Estimated Development Time:**
- Professional developer: 8-12 hours
- AI-assisted: 2-4 hours
- DIY beginner: 16-24 hours

**Result:** A stunning, comprehensive pitching website that makes judges say "Wow, this is professional!"

---

*Document Version: 1.0*
*Last Updated: October 4, 2025*
*Created by: RECTOR with assistance from Claude*
