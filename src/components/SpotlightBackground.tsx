import { useCallback, useEffect, useRef } from "react"
import type { CSSProperties, PointerEvent, ReactNode } from "react"
import styles from "./SpotlightBackground.module.scss"

const DEFAULT_RADIUS = 180
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
	const latestPointRef = useRef({ x: -9999, y: -9999, alpha: 0 })

	const applyPosition = useCallback(() => {
		rafIdRef.current = null
		const node = wrapRef.current
		if (!node) return
		const { x, y, alpha } = latestPointRef.current
		setCssVars(node, {
			x,
			y,
			radius,
			fade,
			alpha,
		})
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
			latestPointRef.current = {
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
			latestPointRef.current = {
				...latestPointRef.current,
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
		latestPointRef.current = { x: centerX, y: centerY, alpha: 0 }
		setCssVars(node, { x: centerX, y: centerY, radius, fade, alpha: 0 })
		requestAnimationFrame(() => {
			setCssVars(node, {
				x: centerX,
				y: centerY,
				radius,
				fade,
				alpha: 1,
			})
		})
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
