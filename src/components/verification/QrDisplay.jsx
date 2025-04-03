import { QRCodeSVG } from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useState } from 'react';

const QrDisplay = ({ verificationId, secretCode }) => {
  const [copied, setCopied] = useState(false);
  const verificationUrl = `${window.location.origin}/verify/${verificationId}/${secretCode}`;

  return (
    <div className="verification-step qr-display">
      <div className="qr-container">
        <QRCodeSVG 
          value={verificationUrl}
          size={256}
          level="H"
          includeMargin={true}
        />
        <div className="qr-overlay" />
      </div>

      <h2>Scan to Complete Verification</h2>
      <p>Open your mobile device and scan this QR code to finish verification</p>

      <div className="url-display">
        <code>{verificationUrl}</code>
        <CopyToClipboard 
          text={verificationUrl}
          onCopy={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          <button>{copied ? 'Copied!' : 'Copy Link'}</button>
        </CopyToClipboard>
      </div>

      <div className="timer-display">
        <ClockIcon />
        <span>Expires in: 14:32</span>
      </div>
    </div>
  );
};

export default QrDisplay