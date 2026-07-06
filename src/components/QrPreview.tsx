import { motion, useAnimationControls } from 'framer-motion'
import { forwardRef, useEffect } from 'react'

interface QrPreviewProps {
  /** Serialized config; changes trigger a subtle crossfade pulse. */
  signature: string
}

/**
 * Displays the live QR canvas. The `qr-code-styling` instance mutates the
 * canvas in place (via the forwarded container ref), so instead of remounting
 * we play a short Framer Motion crossfade whenever the signature changes.
 */
export const QrPreview = forwardRef<HTMLDivElement, QrPreviewProps>(
  function QrPreview({ signature }, ref) {
    const controls = useAnimationControls()

    useEffect(() => {
      controls.start({
        opacity: [0.4, 1],
        scale: [0.985, 1],
        transition: { duration: 0.32, ease: 'easeOut' },
      })
    }, [signature, controls])

    return (
      <div className="relative flex items-center justify-center">
        {/* Ambient glow ring */}
        <motion.div
          aria-hidden
          className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-accent/25 to-accent-2/25 blur-2xl"
          animate={ { opacity: [0.5, 0.8, 0.5] } }
          transition={ { duration: 5, repeat: Infinity, ease: 'easeInOut' } }
        />
        <motion.div
          animate={ controls }
          className="relative rounded-3xl bg-white p-4 shadow-card ring-1 ring-black/5"
        >
          <div
            ref={ ref }
            className="[&>canvas]:block [&>canvas]:h-[min(50vh,420px)] [&>canvas]:w-[min(50vh,420px)] [&>canvas]:rounded-xl [&>svg]:block [&>svg]:h-[min(50vh,420px)] [&>svg]:w-[min(50vh,420px)] [&>svg]:rounded-xl"
          />
        </motion.div>
      </div>
    )
  },
)
