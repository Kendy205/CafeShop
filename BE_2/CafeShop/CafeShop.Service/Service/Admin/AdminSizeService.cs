using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Size;
using CafeShop.Model;
using CafeShop.Service.IService.Admin;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Admin
{
    public class AdminSizeService : IAdminSizeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminSizeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
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
