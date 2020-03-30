import { hasBreakpoint } from "../mock-debug/model";
import { AddBreakpointAction, RemoveBreakpointAction } from "../mock-debug/set-breakpoint";


@injectable()
export class BreakpointContextMenuProviderRegistry implements IContextMenuItemProvider {
    getItems(root: Readonly<SModelRoot>, lastMousePosition?: Point): Promise<MenuItem[]> {
        const selectedElements = Array.from(root.index.all().filter(isSelected).filter(hasBreakpoint));
        return Promise.resolve([
            {
                id: "addBreakpoint",
                label: "Add Breakpoint",
                sortString: "z",
                group: "breakpoint",
                actions: [new AddBreakpointAction(selectedElements)],
                isEnabled: () => selectedElements.length > 0,
                isVisible: () => true,
                isToggled: () => false
            },
            {
                id: "removeBreakpoint",
                label: "Remove Breakpoint",
                sortString: "z",
                group: "breakpoint",
                actions: [new RemoveBreakpointAction(selectedElements)],
                isEnabled: () => selectedElements.length > 0,
                isVisible: () => true,
                isToggled: () => false
            }
        ]);
    }
}
