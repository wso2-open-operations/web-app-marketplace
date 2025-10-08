# client retry configuration for max retry attempts.
public const int RETRY_COUNT = 3;

# client retry configuration for wait interval in seconds.
public const decimal RETRY_INTERVAL = 3.0;

# client retry configuration for interval increment in seconds.
public const float RETRY_BACKOFF_FACTOR = 2.0;

# client retry configuration for maximum wait interval in seconds.
public const decimal RETRY_MAX_INTERVAL = 20.0;
