import { Component, type CSSProperties, type HTMLAttributes } from "react";

interface IconButtonProps {
	strIconName: string;
}

export class IconButton extends Component<
	IconButtonProps & HTMLAttributes<HTMLDivElement>
> {
	render() {
		const { strIconName } = this.props;

		return (
			<div
				{...this.props}
				className="icon-button"
				style={{ "--icon": `var(--icon-${strIconName})` } as CSSProperties}
			/>
		);
	}
}
