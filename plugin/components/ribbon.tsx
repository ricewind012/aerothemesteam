import { Component, type FC, type ReactNode } from "react";

import { Localize } from "@/modules/localization";
import { BuildClassName } from "@/shared";

import { IconButton } from "./iconbutton";

interface RibbonButtonProps {
	/** Arguments for localization. */
	args?: string[];
	disabled?: boolean;
	/** Icon name for {@link IconButton}. */
	icon: string;
	/** Localization token. */
	text: string;
	/** Vertical layout? */
	vertical?: boolean;
	onArrowClick?: () => void;
	onClick: () => void;
}

export function RibbonButton(props: RibbonButtonProps) {
	const { args, disabled, icon, text, vertical, onClick, onArrowClick } = props;
	const strContainerClassName = BuildClassName([
		"ribbon-button-container",
		disabled && "disabled",
		vertical && "vertical",
	]);
	const strArrowClassName = BuildClassName([
		"ribbon-button-arrow",
		vertical && "vertical",
	]);

	return (
		<div id={text.replace("#", "")} className={strContainerClassName}>
			<div
				className="ribbon-button"
				onClick={onClick}
				onContextMenu={onArrowClick}
			>
				<IconButton name={icon} />
				{Localize(text, ...(args || []))}
			</div>
			{onArrowClick && (
				<div className={strArrowClassName} onClick={onArrowClick} />
			)}
		</div>
	);
}

interface RibbonSectionProps {
	children: ReactNode;
	title: string;
}

export const RibbonSection: FC<RibbonSectionProps> = ({ children, title }) => (
	<div className="ribbon-section">
		<div className="ribbon-section-body">{children}</div>
		<div className="ribbon-section-title">{Localize(title)}</div>
	</div>
);

interface RibbonContainerProps {
	children?: ReactNode;
}

export const RibbonContainer: FC<RibbonContainerProps> = ({ children }) => (
	<div className="ribbon-container">{children}</div>
);

interface RibbonGameSectionButtonProps {
	appid: number;
}

export class RibbonGameSectionButton<S = {}> extends Component<
	RibbonGameSectionButtonProps,
	S
> {}
