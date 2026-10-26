package ar.edu.unsam.cody.engine;

import java.util.List;

/**
 * Plain Java version of an algorithm, shown next to its pseudocode, with the Java line that
 * corresponds to each pseudocode line. Steps point to pseudocode lines; this mapping lets the
 * frontend highlight the same instruction in Java.
 *
 * @param lines              the Java source, one entry per line
 * @param lineForPseudocode  entry i is the Java line (starting at 1) for pseudocode line i + 1
 */
public record JavaListing(List<String> lines, List<Integer> lineForPseudocode) {

    public JavaListing {
        lines = List.copyOf(lines);
        lineForPseudocode = List.copyOf(lineForPseudocode);
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("The Java listing cannot be empty");
        }
        for (int line : lineForPseudocode) {
            if (line < 1 || line > lines.size()) {
                throw new IllegalArgumentException("Java line " + line + " is outside the listing");
            }
        }
    }

    /**
     * Java line for a pseudocode line.
     *
     * @param pseudocodeLine pseudocode line, starting at 1
     * @return the matching Java line, starting at 1
     */
    public int javaLineFor(int pseudocodeLine) {
        return lineForPseudocode.get(pseudocodeLine - 1);
    }
}
