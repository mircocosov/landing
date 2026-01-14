import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"

type CursorRingProps = {
	size?: number
	backgroundImage: string
}

const DEFAULT_SIZE = 140

const isCoarsePointer = () =>
	window.matchMedia("(pointer: coarse)").matches ||
	window.matchMedia("(hover: none)").matches

const CursorRing = ({
	size = DEFAULT_SIZE,
	backgroundImage,
}: CursorRingProps) => {
	const ringRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (isCoarsePointer()) return
		const ring = ringRef.current
		if (!ring) return
		const ringBg = ring.querySelector<HTMLDivElement>(".cursor-ring__bg")
		if (!ringBg) return

		const backgroundSource =
			document.querySelector<HTMLElement>("[data-cursor-ring-source]") ??
			document.body
		const getBackgroundStyles = () => getComputedStyle(backgroundSource)
		let backgroundStyles = getBackgroundStyles()

		const updateBackgroundBase = () => {
			backgroundStyles = getBackgroundStyles()
			const computedImage =
				backgroundStyles.backgroundImage !== "none"
					? backgroundStyles.backgroundImage
					: `url(${backgroundImage})`

			ringBg.style.backgroundImage = computedImage
			ringBg.style.backgroundRepeat = backgroundStyles.backgroundRepeat
			ringBg.style.backgroundAttachment =
				backgroundStyles.backgroundAttachment
		}

		const target = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
			active: 0,
		}
		const current = { ...target }
		const easing = 0.18
		let rafId: number | null = null

		const metrics = {
			imageWidth: 0,
			imageHeight: 0,
			drawnWidth: 0,
			drawnHeight: 0,
			offsetX: 0,
			offsetY: 0,
			containerWidth: 0,
			containerHeight: 0,
			isFixedAttachment: false,
		}

		const extractImageUrl = (value: string) => {
			const match = value.match(/url\(["']?(.*?)["']?\)/)
			return match ? match[1] : ""
		}

		const resolvePositionToken = (token: string) => {
			if (!token) return { type: "percent" as const, value: 0.5 }
			if (token === "center")
				return { type: "percent" as const, value: 0.5 }
			if (token === "left" || token === "top")
				return { type: "percent" as const, value: 0 }
			if (token === "right" || token === "bottom")
				return { type: "percent" as const, value: 1 }
			if (token.endsWith("%"))
				return {
					type: "percent" as const,
					value: parseFloat(token) / 100,
				}
			if (token.endsWith("px"))
				return { type: "px" as const, value: parseFloat(token) }
			const numeric = Number.parseFloat(token)
			if (!Number.isNaN(numeric))
				return { type: "px" as const, value: numeric }
			return { type: "percent" as const, value: 0.5 }
		}

		const resolveOffset = (
			token: string,
			containerSize: number,
			drawnSize: number
		) => {
			const parsed = resolvePositionToken(token)
			if (parsed.type === "px") return parsed.value
			return (containerSize - drawnSize) * parsed.value
		}

		const resolveSizeToken = (
			token: string,
			containerSize: number,
			imageSize: number
		) => {
			if (!token || token === "auto") return "auto"
			if (token.endsWith("%"))
				return (containerSize * parseFloat(token)) / 100
			if (token.endsWith("px")) return parseFloat(token)
			if (token === "cover" || token === "contain") return token
			const numeric = Number.parseFloat(token)
			if (!Number.isNaN(numeric)) return numeric
			return imageSize || containerSize
		}

		const computeDrawnSize = (
			containerWidth: number,
			containerHeight: number
		) => {
			const backgroundSize = backgroundStyles.backgroundSize.trim()
			if (!metrics.imageWidth || !metrics.imageHeight) {
				metrics.drawnWidth = containerWidth
				metrics.drawnHeight = containerHeight
				return
			}

			if (backgroundSize === "cover") {
				const scale = Math.max(
					containerWidth / metrics.imageWidth,
					containerHeight / metrics.imageHeight
				)
				metrics.drawnWidth = metrics.imageWidth * scale
				metrics.drawnHeight = metrics.imageHeight * scale
				return
			}

			if (backgroundSize === "contain") {
				const scale = Math.min(
					containerWidth / metrics.imageWidth,
					containerHeight / metrics.imageHeight
				)
				metrics.drawnWidth = metrics.imageWidth * scale
				metrics.drawnHeight = metrics.imageHeight * scale
				return
			}

			const parts = backgroundSize.split(/\s+/)
			const sizeX = resolveSizeToken(
				parts[0],
				containerWidth,
				metrics.imageWidth
			)
			const sizeY = resolveSizeToken(
				parts[1] ?? "auto",
				containerHeight,
				metrics.imageHeight
			)
			const ratio = metrics.imageWidth / metrics.imageHeight

			if (sizeX === "auto" && sizeY === "auto") {
				metrics.drawnWidth = metrics.imageWidth
				metrics.drawnHeight = metrics.imageHeight
				return
			}

			if (sizeX === "auto" && typeof sizeY === "number") {
				metrics.drawnHeight = sizeY
				metrics.drawnWidth = sizeY * ratio
				return
			}

			if (sizeY === "auto" && typeof sizeX === "number") {
				metrics.drawnWidth = sizeX
				metrics.drawnHeight = sizeX / ratio
				return
			}

			if (typeof sizeX === "number" && typeof sizeY === "number") {
				metrics.drawnWidth = sizeX
				metrics.drawnHeight = sizeY
			}
		}

		const updateMetrics = () => {
			updateBackgroundBase()
			const rect = backgroundSource.getBoundingClientRect()
			metrics.isFixedAttachment =
				backgroundStyles.backgroundAttachment === "fixed"
			metrics.containerWidth = metrics.isFixedAttachment
				? window.innerWidth
				: rect.width
			metrics.containerHeight = metrics.isFixedAttachment
				? window.innerHeight
				: rect.height

			computeDrawnSize(metrics.containerWidth, metrics.containerHeight)

			const positionTokens =
				backgroundStyles.backgroundPosition.split(/\s+/)
			const posXToken = positionTokens[0] ?? "50%"
			const posYToken = positionTokens[1] ?? "50%"
			metrics.offsetX = resolveOffset(
				posXToken,
				metrics.containerWidth,
				metrics.drawnWidth
			)
			metrics.offsetY = resolveOffset(
				posYToken,
				metrics.containerHeight,
				metrics.drawnHeight
			)

			ringBg.style.backgroundSize = `${metrics.drawnWidth}px ${metrics.drawnHeight}px`
		}

		const updateBackgroundPosition = () => {
			const rect = backgroundSource.getBoundingClientRect()
			const localX = metrics.isFixedAttachment
				? current.x
				: current.x - rect.left
			const localY = metrics.isFixedAttachment
				? current.y
				: current.y - rect.top
			const bgX = metrics.offsetX - localX + size / 2
			const bgY = metrics.offsetY - localY + size / 2
			ringBg.style.backgroundPosition = `${bgX}px ${bgY}px`
		}

		const image = new Image()
		image.onload = () => {
			metrics.imageWidth = image.naturalWidth
			metrics.imageHeight = image.naturalHeight
			updateMetrics()
		}
		image.onerror = () => {
			updateMetrics()
		}
		const imageUrl = extractImageUrl(backgroundStyles.backgroundImage)
		if (imageUrl) {
			image.src = imageUrl
		} else if (backgroundImage) {
			image.src = backgroundImage
		}

		updateMetrics()

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
			ring.style.setProperty("--cursor-active", `${nextActive}`)
			updateBackgroundPosition()

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
				ring.style.setProperty("--cursor-active", `${target.active}`)
				updateBackgroundPosition()
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
		window.addEventListener("resize", updateMetrics)

		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId)
			window.removeEventListener("pointermove", handlePointerMove)
			window.removeEventListener("pointerdown", handlePointerMove)
			window.removeEventListener("pointerleave", handlePointerLeave)
			window.removeEventListener("blur", handlePointerLeave)
			window.removeEventListener("resize", updateMetrics)
		}
	}, [size, backgroundImage])

	if (typeof window !== "undefined" && isCoarsePointer()) {
		return null
	}

	return (
		<div
			ref={ringRef}
			className="cursor-ring"
			aria-hidden="true"
			style={
				{
					"--cursor-ring-size": `${size}px`,
				} as CSSProperties
			}
		>
			<div className="cursor-ring__bg" />
		</div>
	)
}

export default CursorRing
