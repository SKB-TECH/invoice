type Handler = () => void;
class AuthEvents {
    private logoutHandlers = new Set<Handler>();

    onLogout(fn: Handler): () => void {
        this.logoutHandlers.add(fn);
        return () => this.logoutHandlers.delete(fn);
    }

    emitLogout(): void {
        this.logoutHandlers.forEach((fn) => fn());
    }
}

export const authEvents = new AuthEvents();
