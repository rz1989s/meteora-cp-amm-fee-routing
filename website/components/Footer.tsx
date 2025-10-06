import { Github, Twitter, MessageCircle, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Logo size={32} />
              <span className="font-bold text-xl">Meteora Fee Routing</span>
            </div>
            <p className="text-slate-400 text-sm">
              Permissionless fee routing program for Meteora DAMM V2 (CP-AMM) pools.
              Built for the Superteam Bounty.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/technical" className="text-slate-400 hover:text-primary transition-colors">
                  Technical Details
                </Link>
              </li>
              <li>
                <Link href="/testing" className="text-slate-400 hover:text-primary transition-colors">
                  Test Results
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-slate-400 hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/submission" className="text-slate-400 hover:text-primary transition-colors">
                  Team & Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/rz1989s/meteora-cp-amm-fee-routing#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <FileText size={16} />
                  <span>README</span>
                </a>
              </li>
              <li>
                <a
                  href="https://docs.meteora.ag/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <BookOpen size={16} />
                  <span>Meteora Docs</span>
                </a>
              </li>
              <li>
                <a
                  href="https://docs.streamflow.finance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <BookOpen size={16} />
                  <span>Streamflow Docs</span>
                </a>
              </li>
              <li>
                <a
                  href="https://book.anchor-lang.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <BookOpen size={16} />
                  <span>Anchor Book</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect & Support</h3>
            <div className="flex space-x-3 mb-4">
              <a
                href="https://github.com/rz1989s/meteora-cp-amm-fee-routing"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                title="GitHub Repository"
              >
                <Github size={20} />
              </a>
              <a
                href="https://x.com/RZ1989sol"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Twitter / X"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://t.me/RZ1989sol"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Telegram"
              >
                <MessageCircle size={20} />
              </a>
            </div>
            <div className="text-sm text-slate-400">
              <p className="mb-2">For questions or issues:</p>
              <ul className="space-y-1 text-xs">
                <li>• Telegram: <a href="https://t.me/RZ1989sol" className="text-primary hover:underline">@RZ1989sol</a></li>
                <li>• Twitter: <a href="https://x.com/RZ1989sol" className="text-primary hover:underline">@RZ1989sol</a></li>
                <li>• GitHub: <a href="https://github.com/rz1989s/meteora-cp-amm-fee-routing/issues" className="text-primary hover:underline">Create an issue</a></li>
              </ul>
            </div>
            <div className="mt-4 text-sm text-slate-400">
              <p>Program ID:</p>
              <code className="text-xs bg-slate-800 px-2 py-1 rounded mt-1 inline-block break-all">
                RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP
              </code>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 RECTOR. Submission for Meteora DAMM V2 Fee Routing Bounty.</p>
        </div>
      </div>
    </footer>
  );
}
