package com.example.voyagr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Voyagr backend entry point.
 * <p>
 * Async is enabled because {@link org.example.voyagr.ai.RagOrchestrator} fans
 * weather, places, and flight calls out in parallel via
 * {@link java.util.concurrent.CompletableFuture}.
 */

@SpringBootApplication
public class VoyagrApplication {
	public static void main(String[] args) {
		SpringApplication.run(VoyagrApplication.class, args);
	}

}
