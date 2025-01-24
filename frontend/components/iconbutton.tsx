import { Component, type CSSProperties, type HTMLAttributes } from "react";

interface IconButtonProps {
	name: string;
}

export class IconButton extends Component<
	IconButtonProps & HTMLAttributes<HTMLDivElement>
> {
	render() {
		const { name } = this.props;

		return (
			<div
				{...this.props}
				className="icon-button"
				style={{ "--icon": `var(--icon-${name})` } as CSSProperties}
			/>
		);
	}
}
