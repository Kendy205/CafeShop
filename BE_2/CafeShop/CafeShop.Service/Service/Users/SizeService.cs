using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Size;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.Services
{
    public class SizeService : ISizeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SizeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<Size>> GetAllAsync()
        {
            return await _unitOfWork.Size.GetAllAsync();
        }

        public async Task<Size> GetByIdAsync(int id)
        {
            return await _unitOfWork.Size.GetFirstOrDefaultAsync(p => p.SizeId == id);
        }

        public async Task AddAsync(Size entity)
        {
            await _unitOfWork.Size.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(Size entity)
        {
            _unitOfWork.Size.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Size.GetFirstOrDefaultAsync(p => p.SizeId == id);
            if (entity != null)
            {
                _unitOfWork.Size.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
        public async Task<List<SizeDto>> GetAllSizesAsync()
        {
            var sizes = await _unitOfWork.Size.GetAllAsync();
            return _mapper.Map<List<SizeDto>>(sizes);
        }

        public async Task<SizeDto> CreateSizeAsync(CreateUpdateSizeDto request)
        {
            var size = _mapper.Map<Size>(request);
            await _unitOfWork.Size.AddAsync(size);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<SizeDto>(size);
        }

        public async Task<SizeDto> UpdateSizeAsync(int id, CreateUpdateSizeDto request)
        {
            var size = await _unitOfWork.Size.GetFirstOrDefaultAsync(s => s.SizeId == id);
            if (size == null) throw new ArgumentException("Không tìm thấy Size!");

            _mapper.Map(request, size);
            _unitOfWork.Size.Update(size);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<SizeDto>(size);
        }

        public async Task DeleteSizeAsync(int id)
        {
            var size = await _unitOfWork.Size.GetFirstOrDefaultAsync(s => s.SizeId == id);
            if (size == null) throw new ArgumentException("Không tìm thấy Size!");

            _unitOfWork.Size.Remove(size);
            await _unitOfWork.SaveAsync();
        }
    }
}
