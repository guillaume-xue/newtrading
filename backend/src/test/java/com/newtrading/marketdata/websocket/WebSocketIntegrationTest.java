package com.newtrading.marketdata.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.newtrading.alerts.repository.AlertRepository;
import com.newtrading.auth.repository.UserRepository;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.PriceBroadcasterService;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import com.newtrading.shared.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnableAutoConfiguration(exclude = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        FlywayAutoConfiguration.class
})
class WebSocketIntegrationTest {

    @LocalServerPort
    private int port;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private VirtualPortfolioRepository virtualPortfolioRepository;

    @MockBean
    private SimulatedTransactionRepository simulatedTransactionRepository;

    @MockBean
    private AlertRepository alertRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PriceBroadcasterService priceBroadcasterService;

    private WebSocketStompClient stompClient;

    @BeforeEach
    void setUp() {
        // Utilisation du client WebSocket standard natif (connecté à ws://.../ws)
        this.stompClient = new WebSocketStompClient(new StandardWebSocketClient());

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        this.stompClient.setMessageConverter(converter);
    }

    @Test
    void shouldConnectWithValidJwtAndReceiveQuoteBroadcast() throws Exception {
        String token = jwtTokenProvider.generateToken(UUID.randomUUID(), "test@trading.com");

        StompHeaders connectHeaders = new StompHeaders();
        connectHeaders.add("Authorization", "Bearer " + token);

        String url = "ws://localhost:" + port + "/ws";
        CompletableFuture<QuoteDto> quoteReceived = new CompletableFuture<>();

        StompSession session = stompClient.connectAsync(
                url,
                new WebSocketHttpHeaders(),
                connectHeaders,
                new StompSessionHandlerAdapter() {
                    @Override
                    public void handleException(StompSession session, StompCommand command, StompHeaders headers, byte[] payload, Throwable exception) {
                        quoteReceived.completeExceptionally(exception);
                    }

                    @Override
                    public void handleTransportError(StompSession session, Throwable exception) {
                        quoteReceived.completeExceptionally(exception);
                    }
                }
        ).get(5, TimeUnit.SECONDS);

        assertThat(session.isConnected()).isTrue();

        session.subscribe("/topic/market/AAPL", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return QuoteDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                quoteReceived.complete((QuoteDto) payload);
            }
        });

        // Laisser 300ms au broker en mémoire pour finaliser l'enregistrement de l'abonnement
        Thread.sleep(300);

        QuoteDto quoteToSend = QuoteDto.builder()
                .symbol("AAPL")
                .price(new BigDecimal("190.25"))
                .timestamp(Instant.now())
                .build();

        priceBroadcasterService.broadcastQuote(quoteToSend);

        QuoteDto received = quoteReceived.get(5, TimeUnit.SECONDS);

        assertThat(received).isNotNull();
        assertThat(received.getSymbol()).isEqualTo("AAPL");
        assertThat(received.getPrice()).isEqualByComparingTo("190.25");

        session.disconnect();
    }
}
