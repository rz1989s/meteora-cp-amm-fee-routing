#!/bin/bash

# ANSI colors and styles
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# Function to print banner with color cycling
print_banner() {
  local colors=("${CYAN}" "${BLUE}" "${PURPLE}" "${RED}" "${YELLOW}" "${GREEN}")

  for color in "${colors[@]}"; do
    clear
    echo ""
    echo -e "${CYAN}===============================================================================${RESET}"
    echo ""
    echo -e "  ${color}████████╗${RESET} ${color}██╗  ██╗${RESET}  ${color}█████╗${RESET}  ${color}███╗   ██╗${RESET} ${color}██╗  ██╗${RESET} ${color}███████╗${RESET}"
    echo -e "  ${color}╚══██╔══╝${RESET} ${color}██║  ██║${RESET} ${color}██╔══██╗${RESET} ${color}████╗  ██║${RESET} ${color}██║ ██╔╝${RESET} ${color}██╔════╝${RESET}"
    echo -e "     ${color}██║${RESET}    ${color}███████║${RESET} ${color}███████║${RESET} ${color}██╔██╗ ██║${RESET} ${color}█████╔╝${RESET}  ${color}███████╗${RESET}"
    echo -e "     ${color}██║${RESET}    ${color}██╔══██║${RESET} ${color}██╔══██║${RESET} ${color}██║╚██╗██║${RESET} ${color}██╔═██╗${RESET}  ${color}╚════██║${RESET}"
    echo -e "     ${color}██║${RESET}    ${color}██║  ██║${RESET} ${color}██║  ██║${RESET} ${color}██║ ╚████║${RESET} ${color}██║  ██╗${RESET} ${color}███████║${RESET}"
    echo -e "     ${color}╚═╝${RESET}    ${color}╚═╝  ╚═╝${RESET} ${color}╚═╝  ╚═╝${RESET} ${color}╚═╝  ╚═══╝${RESET} ${color}╚═╝  ╚═╝${RESET} ${color}╚══════╝${RESET}"
    sleep 0.08
  done
}

# Clear screen and show color cycling banner
clear
print_banner

# Final rainbow banner
clear
echo ""
echo -e "${CYAN}===============================================================================${RESET}"
echo ""
echo -e "  ${YELLOW}████████╗${RESET} ${GREEN}██╗  ██╗${RESET}  ${BLUE}█████╗${RESET}  ${PURPLE}███╗   ██╗${RESET} ${RED}██╗  ██╗${RESET} ${CYAN}███████╗${RESET}"
sleep 0.08
echo -e "  ${YELLOW}╚══██╔══╝${RESET} ${GREEN}██║  ██║${RESET} ${BLUE}██╔══██╗${RESET} ${PURPLE}████╗  ██║${RESET} ${RED}██║ ██╔╝${RESET} ${CYAN}██╔════╝${RESET}"
sleep 0.08
echo -e "     ${YELLOW}██║${RESET}    ${GREEN}███████║${RESET} ${BLUE}███████║${RESET} ${PURPLE}██╔██╗ ██║${RESET} ${RED}█████╔╝${RESET}  ${CYAN}███████╗${RESET}"
sleep 0.08
echo -e "     ${YELLOW}██║${RESET}    ${GREEN}██╔══██║${RESET} ${BLUE}██╔══██║${RESET} ${PURPLE}██║╚██╗██║${RESET} ${RED}██╔═██╗${RESET}  ${CYAN}╚════██║${RESET}"
sleep 0.08
echo -e "     ${YELLOW}██║${RESET}    ${GREEN}██║  ██║${RESET} ${BLUE}██║  ██║${RESET} ${PURPLE}██║ ╚████║${RESET} ${RED}██║  ██╗${RESET} ${CYAN}███████║${RESET}"
sleep 0.08
echo -e "     ${YELLOW}╚═╝${RESET}    ${GREEN}╚═╝  ╚═╝${RESET} ${BLUE}╚═╝  ╚═╝${RESET} ${PURPLE}╚═╝  ╚═══╝${RESET} ${RED}╚═╝  ╚═╝${RESET} ${CYAN}╚══════╝${RESET}"
sleep 0.15
echo ""
echo -e "                  ${BOLD}${WHITE}✨ for Watching This Video! ✨${RESET}"
echo ""
echo -e "${CYAN}===============================================================================${RESET}"
echo ""
sleep 0.2

# Project Info
echo -e "  ${YELLOW}🚀 PROJECT:${RESET}"
echo -e "     ${BOLD}Meteora CP-AMM Fee Routing${RESET}"
echo ""
sleep 0.2

echo -e "  ${GREEN}✅ STATUS:${RESET}"
echo -e "     ${BOLD}${GREEN}100% Complete - Production Ready${RESET}"
echo ""
sleep 0.2

echo -e "  ${BLUE}🧪 TESTS:${RESET}"
echo -e "     ${BOLD}${GREEN}54/54 PASSING${RESET} ${DIM}(0 pending, 0 failed)${RESET}"
sleep 0.1
printf "     ${GREEN}✓${RESET} Local Integration : ${BOLD}22/22${RESET}\n"
sleep 0.05
printf "     ${GREEN}✓${RESET} E2E Integration   : ${BOLD}15/15${RESET}\n"
sleep 0.05
printf "     ${GREEN}✓${RESET} Live Devnet       : ${BOLD}10/10${RESET}\n"
sleep 0.05
printf "     ${GREEN}✓${RESET} Rust Unit         : ${BOLD}7/7${RESET}\n"
echo ""
sleep 0.2

echo -e "  ${PURPLE}⚙️  BUILD:${RESET}"
echo -e "     ${BOLD}371KB${RESET} binary, ${GREEN}${BOLD}0 warnings${RESET}"
echo ""
sleep 0.2

echo -e "  ${RED}🔥 COVERAGE:${RESET}"
echo -e "     ${BOLD}Triple-Bundle Strategy${RESET}"
echo -e "     ${DIM}(Local + E2E + Devnet)${RESET}"
echo ""
echo -e "${CYAN}===============================================================================${RESET}"
echo ""
sleep 0.25

# Quick Links (with aligned colons using printf)
echo -e "  ${BOLD}${CYAN}⚡ QUICK LINKS${RESET}"
echo ""
sleep 0.1
printf "  ${GREEN}🐙 GitHub  ${RESET}: github.com/yourusername/meteora-cp-amm-fee-routing\n"
sleep 0.1
printf "  ${PURPLE}🌐 Website ${RESET}: meteora-fee-routing.rectorspace.com\n"
sleep 0.1
printf "  ${YELLOW}⚙️ Program ${RESET}: RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP\n"
sleep 0.1
printf "  ${BLUE}🔍 Solscan ${RESET}: solscan.io/account/RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP?cluster=devnet\n"
echo ""
echo -e "${CYAN}===============================================================================${RESET}"
echo ""
sleep 0.3

# Islamic blessing with sparkle effect
echo -e "         ${YELLOW}✨${RESET}     ${YELLOW}⭐${RESET}  ${BOLD}${WHITE}JazakAllahu khairan for your time!${RESET}  ${YELLOW}⭐${RESET}     ${YELLOW}✨${RESET}"
sleep 0.1
echo -e "      ${YELLOW}⭐${RESET}                                                            ${YELLOW}⭐${RESET}"
sleep 0.1
echo ""
echo -e "     ${YELLOW}✨${RESET}          ${GREEN}🤲 May Allah bless your coding journey! 🤲${RESET}          ${YELLOW}✨${RESET}"
sleep 0.1
echo ""
echo -e "      ${YELLOW}⭐${RESET}                                                            ${YELLOW}⭐${RESET}"
sleep 0.1
echo -e "         ${YELLOW}✨${RESET}                ${DIM}${YELLOW}✨ Alhamdulillah ✨${RESET}                 ${YELLOW}✨${RESET}"
sleep 0.15
echo ""
echo -e "${CYAN}===============================================================================${RESET}"
echo ""
