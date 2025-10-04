# Archive - Historical Documentation

This directory contains **historical documentation from development phases**. These files are preserved for reference but **are no longer active or current**.

⚠️ **For current documentation**, see [`/docs/`](../docs/) directory.

---

## Contents

### Initial Analysis & Planning
**`bounty-analysis.md`** (37KB)
- Initial analysis of bounty requirements
- Test scenarios and acceptance criteria
- **Status**: ✅ Superseded by implementation and `docs/bounty/BOUNTY_REQUIREMENTS_CHECKLIST.md`

**`TASKS.md`** (7.6KB)
- Original task tracking
- **Status**: ✅ Superseded by `docs/PRD_IMPROVEMENTS.md`

**`PROGRESS.md`** (6.3KB)
- Historical progress tracking
- **Status**: ✅ Superseded by `docs/reports/FINAL_STATUS.md`

**`TEST_PLAN.md`** (11KB)
- Original test planning document
- **Status**: ✅ Superseded by actual test implementation in `/tests/`

### Phase 1 Research & Implementation

**`INTEGRATION_GUIDE.md`** (23KB)
- Complete guide for integrating with Meteora DAMM V2 and Streamflow
- Research output from Phase 1
- Contains account structures, CPI examples, integration strategies
- **Status**: ✅ Superseded by actual implementation in `programs/fee-routing/src/`

**`IMPLEMENTATION_SUMMARY.md`** (11KB)
- Technical summary of Phase 1 implementation
- Documents account structures, math module, instruction logic
- **Status**: ✅ Historical reference, implementation complete

**`PHASE1_COMPLETION_REPORT.md`** (12KB)
- Detailed Phase 1 completion report
- Lists deliverables, findings, readiness assessment
- **Status**: ✅ Phase 1 complete, moved to archive

### Error Documentation & Corrections

**`CRITICAL_CORRECTION.md`** (9.1KB)
- Documents DLMM vs DAMM V2 confusion and correction
- Root cause analysis and verification
- **Status**: ✅ Error corrected, kept for historical record
- **Important**: Bounty is about **DAMM V2 (CP-AMM)**, not DLMM!

**`README.md`** (1.9KB)
- This file

---

## When to Reference These Files

| Need | Current Location | Archive Reference |
|------|-----------------|-------------------|
| Bounty requirements | `docs/bounty/bounty-original.md` | `bounty-analysis.md` |
| Integration details | Code in `programs/fee-routing/src/` | `INTEGRATION_GUIDE.md` |
| Account structures | `programs/fee-routing/src/state.rs` | `IMPLEMENTATION_SUMMARY.md` |
| Current status | `docs/reports/FINAL_STATUS.md` | `PROGRESS.md` |
| Test strategy | Actual tests in `/tests/` | `TEST_PLAN.md` |
| Task planning | `docs/PRD_IMPROVEMENTS.md` | `TASKS.md` |

---

## Why Keep Archive?

1. **Project Evolution**: Shows thorough research and iterative development
2. **Decision Context**: Explains why certain approaches were chosen
3. **Error Transparency**: CRITICAL_CORRECTION.md shows problem-solving ability
4. **Learning Reference**: Future developers can see the journey

---

## Navigation

- **📁 Current Documentation**: [`/docs/`](../docs/) - **START HERE**
- **📄 Main README**: [`/README.md`](../README.md)
- **🎯 Project Guidance**: [`/CLAUDE.md`](../CLAUDE.md)
- **🌐 Pitch Website**: [`/website/`](../website/)

---

**Archive Status**: 📦 Historical reference only - Not actively maintained
