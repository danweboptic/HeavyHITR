class DOMUtils {
    static getElement(id, context = document) {
        const element = context.getElementById(id);
        if (!element) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return element;
    }

    static validateRequiredElements(elements) {
        const missing = elements.filter(id => !document.getElementById(id));
        if (missing.length > 0) {
            throw new Error(`Required elements missing: ${missing.join(', ')}`);
        }
    }
}

export default DOMUtils;