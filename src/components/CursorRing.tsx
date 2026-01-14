import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"

type CursorRingProps = {
	size?: number
	backgroundImage: string
}

const DEFAULT_SIZE = 64

const isCoarsePointer = () =>
	window.matchMedia("(pointer: coarse)").matches ||
	window.matchMedia("(hover: none)").matches

const CursorRing = ({ size = DEFAULT_SIZE, backgroundImage }: CursorRingProps) => {
	const ringRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (isCoarsePointer()) return
		const ring = ringRef.current
		if (!ring) return

		const target = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
			active: 0,
		}
		const current = { ...target }
		const easing = 0.18
		let rafId: number | null = null

		const applyPosition = () => {
			const nextX = current.x + (target.x - current.x) * easing
			const nextY = current.y + (target.y - current.y) * easing
			const nextActive =
				current.active + (target.active - current.active) * easing

			current.x = nextX
			current.y = nextY
			current.active = nextActive

			ring.style.transform = `translate3d(${nextX - size / 2}px, ${
				nextY - size / 2
			}px, 0)`
			ring.style.setProperty("--cursor-x", `${nextX}px`)
			ring.style.setProperty("--cursor-y", `${nextY}px`)
			ring.style.setProperty("--cursor-active", `${nextActive}`)

			const isSettled =
				Math.abs(nextX - target.x) < 0.3 &&
				Math.abs(nextY - target.y) < 0.3 &&
				Math.abs(nextActive - target.active) < 0.02

			if (isSettled) {
				current.x = target.x
				current.y = target.y
				current.active = target.active
				ring.style.transform = `translate3d(${target.x - size / 2}px, ${
					target.y - size / 2
				}px, 0)`
				ring.style.setProperty("--cursor-x", `${target.x}px`)
				ring.style.setProperty("--cursor-y", `${target.y}px`)
				ring.style.setProperty("--cursor-active", `${target.active}`)
				rafId = null
				return
			}

			rafId = requestAnimationFrame(applyPosition)
		}

		const scheduleUpdate = () => {
			if (rafId !== null) return
			rafId = requestAnimationFrame(applyPosition)
		}

		const handlePointerMove = (event: PointerEvent) => {
			target.x = event.clientX
			target.y = event.clientY
			target.active = 1
			scheduleUpdate()
		}

		const handlePointerLeave = () => {
			target.active = 0
			scheduleUpdate()
		}

		window.addEventListener("pointermove", handlePointerMove, {
			passive: true,
		})
		window.addEventListener("pointerdown", handlePointerMove, {
			passive: true,
		})
		window.addEventListener("pointerleave", handlePointerLeave)
		window.addEventListener("blur", handlePointerLeave)

		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId)
			window.removeEventListener("pointermove", handlePointerMove)
			window.removeEventListener("pointerdown", handlePointerMove)
			window.removeEventListener("pointerleave", handlePointerLeave)
			window.removeEventListener("blur", handlePointerLeave)
		}
	}, [size])

	return (
		<div
			ref={ringRef}
			className="cursor-ring"
			aria-hidden="true"
			style={
				{
					"--cursor-ring-size": `${size}px`,
					"--cursor-ring-background": `url(${backgroundImage})`,
				} as CSSProperties
			}
		>
			<div className="cursor-ring__bg" />
		</div>
	)
}

export default CursorRing
