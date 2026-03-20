import { useEffect, useRef } from 'react'

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, adds the 'visible' class
 * which triggers the CSS .reveal animation.
 */
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}

/**
 * Reveals a list of elements with staggered delays.
 * Returns a ref to attach to the parent container.
 */
export function useStaggerReveal(selector = '.reveal-child', threshold = 0.1) {
  const ref = useRef(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const children = container.querySelectorAll(selector)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 80)
          })
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [selector, threshold])
  return ref
}
