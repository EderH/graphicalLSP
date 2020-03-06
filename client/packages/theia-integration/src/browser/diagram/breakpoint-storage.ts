export interface DidChangeBreakpointEvent {
    readonly breakpoints: Map<string, Breakpoint>;
}

@injectable()
export class BreakpointsStorage {
    protected readonly onDidChangeBreakpointEmitter = new Emitter<DidChangeBreakpointEvent>();
    readonly onDidChangeBreakpoint: Event<DidChangeBreakpointEvent> = this.onDidChangeBreakpointEmitter.event;

    protected breakpoints: Map<string, Breakpoint> = new Map<string, Breakpoint>();


    public setBreakpoint(breakpoint: Breakpoint) {
        this.breakpoints.set(breakpoint.id, breakpoint);
        const breakpoints = this.breakpoints;
        this.onDidChangeBreakpointEmitter.fire({ breakpoints });
    }

    public removeBreakpoint(breakpoint: Breakpoint) {
        this.breakpoints.delete(breakpoint.id);
        const breakpoints = this.breakpoints;
        this.onDidChangeBreakpointEmitter.fire({ breakpoints });
    }

    public getBreakpoints() {
        return this.breakpoints;
    }
}
