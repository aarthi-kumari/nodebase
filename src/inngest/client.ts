// src/inngest/client.ts
import { Inngest, type InngestFunction } from "inngest";

type CompatCreateFunction = {
	(
		options: { id: string },
		trigger: { event: string },
		handler: ({ event, step }: { event: any; step: any }) => Promise<void>,
	): InngestFunction.Any;
	(...args: Parameters<Inngest["createFunction"]>): ReturnType<Inngest["createFunction"]>;
};

const baseInngest = new Inngest({ id: "nodebase" });
const rawCreateFunction = baseInngest.createFunction.bind(baseInngest);

export const inngest = baseInngest as Inngest & {
	createFunction: CompatCreateFunction;
};

inngest.createFunction = ((
	options: { id: string },
	triggerOrHandler: { event: string } | Parameters<Inngest["createFunction"]>[1],
	maybeHandler?: ({ event, step }: { event: any; step: any }) => Promise<void>,
) => {
	if (typeof maybeHandler === "function") {
		return rawCreateFunction(
			{
				...options,
				triggers: [{ event: (triggerOrHandler as { event: string }).event }],
			},
			maybeHandler,
		);
	}

	return rawCreateFunction(options, triggerOrHandler as Parameters<Inngest["createFunction"]>[1]);
}) as CompatCreateFunction;