package ar.edu.unsam.cody.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class JavaListingTest {

    @Test
    void mapsPseudocodeLinesToJavaLines() {
        JavaListing listing = new JavaListing(List.of("a", "b", "c"), List.of(1, 3));

        assertThat(listing.javaLineFor(1)).isEqualTo(1);
        assertThat(listing.javaLineFor(2)).isEqualTo(3);
    }

    @Test
    void rejectsLinesOutsideTheListing() {
        assertThatThrownBy(() -> new JavaListing(List.of("a"), List.of(2)))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new JavaListing(List.of("a"), List.of(0)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsEmptyListing() {
        assertThatThrownBy(() -> new JavaListing(List.of(), List.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
