import { useCallback, useEffect, useRef } from "react"
import type { CSSProperties, PointerEvent, ReactNode } from "react"
import styles from "./SpotlightBackground.module.scss"

const DEFAULT_RADIUS = 270
const DEFAULT_FADE = 80

type SpotlightVars = {
	x: number
	y: number
	radius: number
	fade: number
	alpha: number
}

type SpotlightBackgroundProps = {
	imageUrl: string
	radius?: number
	fade?: number
	className?: string
	style?: CSSProperties
	children?: ReactNode
	onPointerMove?: (event: PointerEvent<HTMLDivElement>) => void
	onPointerLeave?: (event: PointerEvent<HTMLDivElement>) => void
}

const setCssVars = (
	node: HTMLElement | null,
	{ x, y, radius, fade, alpha }: SpotlightVars
) => {
	if (!node) return
	node.style.setProperty("--mx", `${x}px`)
	node.style.setProperty("--my", `${y}px`)
	node.style.setProperty("--r", `${radius}px`)
	node.style.setProperty("--fade", `${fade}px`)
	node.style.setProperty("--alpha", `${alpha}`)
}

const SpotlightBackground = ({
	imageUrl,
	radius = DEFAULT_RADIUS,
	fade = DEFAULT_FADE,
	className = "",
	style,
	children,
	onPointerMove,
	onPointerLeave,
}: SpotlightBackgroundProps) => {
	const wrapRef = useRef<HTMLDivElement | null>(null)
	const rafIdRef = useRef<number | null>(null)
	const targetPointRef = useRef({ x: -9999, y: -9999, alpha: 0 })
	const currentPointRef = useRef({ x: -9999, y: -9999, alpha: 0 })

	const applyPosition = useCallback(() => {
		const node = wrapRef.current
		if (!node) {
			rafIdRef.current = null
			return
		}
		const easing = 0.18
		const current = currentPointRef.current
		const target = targetPointRef.current
		const nextX = current.x + (target.x - current.x) * easing
		const nextY = current.y + (target.y - current.y) * easing
		const nextAlpha = current.alpha + (target.alpha - current.alpha) * easing
		currentPointRef.current = { x: nextX, y: nextY, alpha: nextAlpha }
		setCssVars(node, {
			x: nextX,
			y: nextY,
			radius,
			fade,
			alpha: nextAlpha,
		})
		const isSettled =
			Math.abs(nextX - target.x) < 0.3 &&
			Math.abs(nextY - target.y) < 0.3 &&
			Math.abs(nextAlpha - target.alpha) < 0.01
		if (isSettled) {
			currentPointRef.current = { ...target }
			setCssVars(node, { ...target, radius, fade })
			rafIdRef.current = null
			return
		}
		rafIdRef.current = requestAnimationFrame(applyPosition)
	}, [radius, fade])

	const scheduleUpdate = useCallback(() => {
		if (rafIdRef.current !== null) return
		rafIdRef.current = requestAnimationFrame(applyPosition)
	}, [applyPosition])

	const handlePointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const node = wrapRef.current
			if (!node) return
			const rect = node.getBoundingClientRect()
			targetPointRef.current = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
				alpha: 1,
			}
			scheduleUpdate()
			onPointerMove?.(event)
		},
		[scheduleUpdate, onPointerMove]
	)

	const handlePointerLeave = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			targetPointRef.current = {
				...targetPointRef.current,
				alpha: 0,
			}
			scheduleUpdate()
			onPointerLeave?.(event)
		},
		[scheduleUpdate, onPointerLeave]
	)

	useEffect(
		() => () => {
			if (rafIdRef.current !== null)
				cancelAnimationFrame(rafIdRef.current)
		},
		[]
	)

	useEffect(() => {
		const node = wrapRef.current
		if (!node) return
		const rect = node.getBoundingClientRect()
		const centerX = rect.width / 2
		const centerY = rect.height / 2
		currentPointRef.current = { x: centerX, y: centerY, alpha: 0 }
		targetPointRef.current = { x: centerX, y: centerY, alpha: 1 }
		setCssVars(node, { x: centerX, y: centerY, radius, fade, alpha: 0 })
		scheduleUpdate()
	}, [radius, fade])

	const styleVars: CSSProperties = {
		"--bg-url": `url(${imageUrl})`,
		"--r": `${radius}px`,
		"--fade": `${fade}px`,
		"--alpha": 0,
		...style,
	} as CSSProperties

	return (
		<div
			className={`${styles.wrap} ${className}`.trim()}
			ref={wrapRef}
			onPointerMove={handlePointerMove}
			onPointerDown={handlePointerMove}
			onPointerLeave={handlePointerLeave}
			style={styleVars}
		>
			<div className={styles.milk} />
			<div className={styles.photo} />
			<div className={styles.content}>{children}</div>
		</div>
	)
}

export default SpotlightBackground
