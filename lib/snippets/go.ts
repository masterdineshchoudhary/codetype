/**
 * Go Code Snippets and Syntax Token Drills
 * Real-world patterns: Goroutines, channels, error handling, structs, interfaces, defer.
 */

export const GO_SNIPPETS: string[] = [
  `func FetchUserWithContext(ctx context.Context, id int64) (*User, error) {
  req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("/users/%d", id), nil)
  if err != nil {
    return nil, fmt.Errorf("failed to build request: %w", err)
  }
  resp, err := http.DefaultClient.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()
  return decodeUser(resp.Body)
}`,

  `type WorkerPool struct {
  tasks   chan Task
  workers int
  wg      sync.WaitGroup
}

func NewWorkerPool(workers int, queueSize int) *WorkerPool {
  return &WorkerPool{
    tasks:   make(chan Task, queueSize),
    workers: workers,
  }
}

func (p *WorkerPool) Start() {
  for i := 0; i < p.workers; i++ {
    p.wg.Add(1)
    go func() {
      defer p.wg.Done()
      for task := range p.tasks {
        task.Execute()
      }
    }()
  }
}`,

  `func PipelineProcessor[T any](input <-chan T, transform func(T) T) <-chan T {
  output := make(chan T)
  go func() {
    defer close(output)
    for val := range input {
      output <- transform(val)
    }
  }()
  return output
}`,

  `type Repository interface {
  FindByID(ctx context.Context, id string) (*Record, error)
  Save(ctx context.Context, record *Record) error
}

func SafeQuery(repo Repository, id string) (*Record, error) {
  if id == "" {
    return nil, errors.New("empty record identifier")
  }
  return repo.FindByID(context.Background(), id)
}`,

  `func FanIn[T any](ch1, ch2 <-chan T) <-chan T {
  out := make(chan T)
  go func() {
    defer close(out)
    for ch1 != nil || ch2 != nil {
      select {
      case v, ok := <-ch1:
        if !ok { ch1 = nil; continue }
        out <- v
      case v, ok := <-ch2:
        if !ok { ch2 = nil; continue }
        out <- v
      }
    }
  }()
  return out
}`
];

export const GO_DRILL_SYMBOLS = [
  ':=', '<-', '!=', '==', 'if err != nil {', 'func()', 'chan T', 'defer',
  '&struct{}', 'sync.WaitGroup', 'context.Context', 'make(chan', 'range',
  'interface{}', 'any', 'select {', 'case <-', 'errors.New'
];
